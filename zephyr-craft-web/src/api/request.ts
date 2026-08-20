import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ResponseCode, type BaseResponse } from './types'

/**
 * 业务异常：携带后端错误码与提示信息。
 */
export class BusinessError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true
})

/** 未登录时无需跳转登录页的白名单请求（登录页自身的初始化查询）。 */
const NOT_LOGIN_REDIRECT_IGNORED = ['/user/getLoginUser', '/user/login', '/user/register']

const redirectToLogin = (url?: string) => {
  if (window.location.pathname === '/login') return
  if (url && NOT_LOGIN_REDIRECT_IGNORED.some((path) => url.includes(path))) return
  window.location.assign('/login')
}

instance.interceptors.response.use(
  (response) => {
    const body = response.data as BaseResponse<unknown>
    // 后端统一返回结构：code 为 0 表示成功，直接拆包返回 data
    if (body && typeof body.code === 'number') {
      if (body.code === ResponseCode.SUCCESS) {
        return response
      }
      if (body.code === ResponseCode.NOT_LOGIN_ERROR) {
        redirectToLogin(response.config?.url)
      }
      throw new BusinessError(body.code, body.message || '请求失败')
    }
    return response
  },
  (error: AxiosError<BaseResponse<unknown>>) => {
    const status = error.response?.status
    const body = error.response?.data
    if (status === 401 || body?.code === ResponseCode.NOT_LOGIN_ERROR) {
      redirectToLogin(error.config?.url)
      throw new BusinessError(ResponseCode.NOT_LOGIN_ERROR, body?.message || '未登录')
    }
    if (body && typeof body.code === 'number') {
      throw new BusinessError(body.code, body.message || '请求失败')
    }
    if (error.code === 'ECONNABORTED') {
      throw new BusinessError(-1, '请求超时，请稍后重试')
    }
    throw new BusinessError(-1, '网络异常，请检查网络连接')
  }
)

/**
 * 发起请求并直接返回拆包后的业务数据。
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<BaseResponse<T>>(config)
  return response.data.data
}

export default instance
