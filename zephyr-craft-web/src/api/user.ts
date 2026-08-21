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

/** 根据用户 ID 获取公开用户资料，无需管理员权限。 */
export const getUserById = (id: string) =>
  request<UserVO>({ url: `/user/getInfo/${id}`, method: 'get' })

/** 与后端 DataContainer<T> 对齐的批量数据容器。 */
export interface DataContainer<T> {
  createData: T[]
  modifyData: T[]
  removeData: T[]
}

/** 与后端 UserBatchSaveRequest 对齐的管理员用户批量操作项。 */
export interface UserBatchSaveRequest {
  id?: string
  account?: string
  password?: string
  confirmPassword?: string
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

/** 管理员批量保存用户的新增、修改和删除操作。 */
export const batchSaveAdmin = (data: DataContainer<UserBatchSaveRequest>) =>
  request<boolean>({ url: '/user/admin/batchSave', method: 'post', data })
