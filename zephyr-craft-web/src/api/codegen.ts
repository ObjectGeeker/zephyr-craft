import { ResponseCode } from './types'

/** 代码生成类型，与后端 CodeGenEnum 对齐。 */
export type CodeGenType = 'HTML' | 'MULTI_FILE'

/** 流式生成请求参数，与后端 CodeGenRequest 对齐。 */
export interface CodeGenParams {
  userMessage: string
  type: CodeGenType
  appId: string
}

/** 流式生成事件回调。 */
export interface CodeGenHandlers {
  /** 收到 AI 输出的代码片段。 */
  onCode: (chunk: string) => void
  /** 生成完成，参数为服务端保存目录。 */
  onComplete: (outputDir: string) => void
  /** 生成失败或连接异常。 */
  onError: (message: string) => void
}

/**
 * 流式生成代码的 SSE 客户端。
 *
 * 浏览器原生 EventSource 不支持 POST 请求，这里用 fetch + ReadableStream 手动解析
 * SSE 事件流（事件以空行分隔，data 支持多行）。返回 AbortController，
 * 供组件卸载时中断连接。
 */
export function streamGenerateCode(params: CodeGenParams, handlers: CodeGenHandlers): AbortController {
  const controller = new AbortController()

  const run = async () => {
    let response: Response
    try {
      response = await fetch('/api/codegen/generateStream', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(params),
        signal: controller.signal
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        handlers.onError('网络异常，请检查网络连接')
      }
      return
    }

    // 非流式响应：请求在建立 SSE 前就失败（未登录、参数错误等），解析统一错误体
    if (!response.ok || !response.body) {
      try {
        const body = (await response.json()) as { code?: number; message?: string }
        if (body.code === ResponseCode.NOT_LOGIN_ERROR) {
          window.location.assign('/login')
          return
        }
        handlers.onError(body.message || '生成失败，请稍后重试')
      } catch {
        handlers.onError('生成失败，请稍后重试')
      }
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // SSE 事件以空行分隔，跨 chunk 的不完整片段留在缓冲区等待拼接
        let separatorIndex = buffer.indexOf('\n\n')
        while (separatorIndex !== -1) {
          const rawEvent = buffer.slice(0, separatorIndex)
          buffer = buffer.slice(separatorIndex + 2)
          dispatchEvent(rawEvent, handlers)
          separatorIndex = buffer.indexOf('\n\n')
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        handlers.onError('连接中断，请重试')
      }
    }
  }

  void run()
  return controller
}

/** 解析单个 SSE 事件块，按事件名分发到对应回调。 */
function dispatchEvent(rawEvent: string, handlers: CodeGenHandlers) {
  let eventName = 'message'
  const dataLines: string[] = []
  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''))
    }
  }
  if (dataLines.length === 0) return
  const data = dataLines.join('\n')
  if (eventName === 'code') {
    handlers.onCode(data)
  } else if (eventName === 'complete') {
    handlers.onComplete(data)
  } else if (eventName === 'error') {
    handlers.onError(data)
  }
}
