import { request } from './request'
import type { PageResult } from './types'

/** 与后端 UserVO 对齐的用户信息。 */
export interface UserVO {
  id: string
  account: string
  username: string
  avatar: string | null
  profile: string | null
  role: string
  createTime: string
  updateTime: string
}

/** 与后端 LoginRequest 对齐的登录请求体。 */
export interface LoginRequest {
  account: string
  password: string
}

/** 与后端 RegisterRequest 对齐的注册请求体。 */
export interface RegisterRequest {
  account: string
  password: string
  confirmPassword: string
}

/** 用户登录，成功后由后端写入 Sa-Token 会话 Cookie。 */
export const login = (data: LoginRequest) =>
  request<UserVO>({ url: '/user/login', method: 'post', data })

/** 用户注册并自动登录。 */
export const register = (data: RegisterRequest) =>
  request<UserVO>({ url: '/user/register', method: 'post', data })

/** 退出登录，注销当前会话。 */
export const logout = () => request<boolean>({ url: '/user/logout', method: 'post' })

/** 获取当前登录用户信息，未登录时抛出未登录业务异常。 */
export const getLoginUser = () =>
  request<UserVO>({ url: '/user/getLoginUser', method: 'get' })

/** 与后端 UserUpdateRequest 对齐的用户资料更新请求体。 */
export interface UserUpdateRequest {
  id: string
  username?: string
  avatar?: string
  profile?: string
}

/** 用户分页查询参数。 */
export interface UserPageQuery {
  current: number
  pageSize: number
}

/** 管理员分页查询用户。 */
export const adminPageUsers = (params: UserPageQuery) =>
  request<PageResult<UserVO>>({ url: '/user/page', method: 'get', params })

/** 管理员创建普通用户，不创建登录会话。 */
export const adminCreateUser = (data: RegisterRequest) =>
  request<UserVO>({ url: '/user/save', method: 'post', data })

/** 管理员更新用户资料（不修改账号、密码和角色）。 */
export const adminUpdateUser = (data: UserUpdateRequest) =>
  request<boolean>({ url: '/user/update', method: 'put', data })

/** 管理员删除用户（逻辑删除）。 */
export const adminRemoveUser = (id: string) =>
  request<boolean>({ url: `/user/remove/${id}`, method: 'delete' })
