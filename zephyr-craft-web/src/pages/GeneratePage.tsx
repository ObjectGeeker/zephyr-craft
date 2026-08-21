import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'
import { previewApp } from '../api/app'
import { streamGenerateCode, type CodeGenType } from '../api/codegen'
import TopNav from '../components/TopNav'

/** 生成类型暂固定为 HTML，与后端创建应用时写死的 codeGenType 保持一致。 */
const GENERATE_TYPE: CodeGenType = 'HTML'

type GenerateStatus = 'generating' | 'done' | 'error'

/** 路由 state 中携带的建站描述。 */
interface GenerateLocationState {
  prompt?: string
}

export default function GeneratePage() {
  const { appId } = useParams<{ appId: string }>()
  const location = useLocation()
  const prompt = (location.state as GenerateLocationState | null)?.prompt

  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<GenerateStatus>('generating')
  const [errorMessage, setErrorMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!appId || !prompt) return
    const controller = streamGenerateCode(
      { userMessage: prompt, type: GENERATE_TYPE, appId },
      {
        onCode: (chunk) => setOutput((prev) => prev + chunk),
        onComplete: () => {
          // 生成产物已保存，取预览地址后切换到 iframe 展示
          previewApp(appId)
            .then((url) => {
              setPreviewUrl(url)
              setStatus('done')
            })
            .catch(() => {
              setErrorMessage('获取预览地址失败，请稍后重试')
              setStatus('error')
            })
        },
        onError: (message) => {
          setErrorMessage(message)
          setStatus('error')
        }
      }
    )
    return () => controller.abort()
  }, [appId, prompt])

  // 对话流追加后自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [output])

  // 直接进入或刷新页面时缺少建站描述，回首页重新发起
  if (!appId || !prompt) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-glow flex h-dvh flex-col overflow-hidden">
      <TopNav />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <section
          aria-label="对话"
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-sm font-medium text-ink">对话</span>
            {status === 'generating' && (
              <span className="text-xs text-ink-muted">AI 正在生成…</span>
            )}
          </header>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {/* 对话流：无气泡无头像，用户描述与 AI 回复顺序向下渲染 */}
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <p className="rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {prompt}
              </p>
              <div className="flex flex-col gap-3">
                {/* AI 回复：Markdown 渲染 + 代码块语法高亮，顺序向下流式输出 */}
                <div className="prose prose-sm max-w-none text-ink-muted break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {output}
                  </ReactMarkdown>
                </div>
                {status === 'generating' && (
                  <span className="animate-pulse font-mono text-sm text-brand" aria-hidden="true">
                    ▍
                  </span>
                )}
                {status === 'error' && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
                    <p className="text-sm text-red-600" role="alert">
                      {errorMessage}
                    </p>
                    <Link
                      to="/"
                      className="shrink-0 text-sm text-brand hover:text-brand-dark"
                    >
                      返回主页
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 用户输入区：仅 UI 展示，暂未接入续聊生成 */}
          <form
            className="border-t border-line px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault()
              // TODO: 后续接入续聊生成，将 draft 作为新一轮 userMessage 发送
            }}
          >
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                rows={1}
                placeholder={
                  status === 'generating' ? 'AI 正在生成中…' : '继续描述你想修改的内容…'
                }
                aria-label="聊天输入"
                className="min-h-11 flex-1 resize-none rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'generating'}
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4Z" />
                </svg>
                发送
              </button>
            </div>
          </form>
        </section>

        <section
          aria-label="网站预览"
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-sm font-medium text-ink">网站预览</span>
            {status === 'done' && previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand hover:text-brand-dark"
              >
                新窗口打开
              </a>
            )}
          </header>
          <div className="relative min-h-0 flex-1">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title="生成的网站预览"
                sandbox="allow-scripts"
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <span className="loading loading-spinner loading-lg text-brand" aria-hidden="true" />
                <p className="text-sm text-ink-muted">
                  {status === 'error' ? '生成失败，暂无预览内容' : '正在生成中…'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
