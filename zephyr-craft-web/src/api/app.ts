import { request } from './request'
import type { PageResult } from './types'
import type { UserVO } from './user'

/** 应用优先级，与后端 AppPriority 保持一致。 */
export const APP_PRIORITY = {
  /** 普通应用。 */
  NORMAL: 0,
  /** 精选应用。 */
  FEATURED: 99
} as const

/** 与后端 AppVO 对齐的应用信息。 */
export interface AppVO {
  id: string
  appName: string
  cover: string | null
  initPrompt: string | null
  codeGenType: string | null
  deployKey: string | null
  deployedTime: string | null
  priority: number
  userId: string
  editTime: string | null
  createTime: string
  updateTime: string
  isDelete: number
  user: UserVO | null
}

/** 用户应用分页查询参数，与后端 AppPageRequest 对齐。 */
export interface AppPageQuery {
  current: number
  pageSize: number
  appName?: string
}

/** 管理员应用分页查询参数，与后端 AppAdminPageRequest 对齐。 */
export interface AppAdminPageQuery {
  current: number
  pageSize: number
  appName?: string
  priority?: number
}

/** 用户更新应用请求体，与后端 AppUpdateRequest 对齐。 */
export interface AppUpdateRequest {
  id: string
  appName: string
}

/** 与后端 DataContainer<T> 对齐的批量数据容器。 */
export interface DataContainer<T> {
  createData: T[]
  modifyData: T[]
  removeData: T[]
}

/** 管理员批量管理应用的数据项，与后端 AppBatchSaveRequest 对齐。 */
export interface AppBatchSaveRequest {
  id?: string
  appName?: string
  cover?: string
  priority?: number
}

/** 创建应用请求体，与后端 AppAddRequest 对齐。 */
export interface AppAddRequest {
  appName?: string
  initPrompt: string
}

/** 分页查询当前登录用户的应用。 */
export const pageMyApps = (params: AppPageQuery) =>
  request<PageResult<AppVO>>({ url: '/app/my/page', method: 'get', params })

/** 为当前登录用户创建应用。 */
export const createApp = (data: AppAddRequest) =>
  request<AppVO>({ url: '/app/save', method: 'post', data })

/** 获取应用生成产物的预览地址。 */
export const previewApp = (id: string) =>
  request<string>({ url: `/app/preview/${id}`, method: 'get' })

/** 重命名当前登录用户的应用。 */
export const updateMyApp = (data: AppUpdateRequest) =>
  request<boolean>({ url: '/app/update', method: 'put', data })

/** 删除当前登录用户的应用。 */
export const removeMyApp = (id: string) =>
  request<boolean>({ url: `/app/remove/${id}`, method: 'delete' })

/** 部署应用，成功后返回访问地址。 */
export const deployApp = (id: string) =>
  request<string>({ url: `/app/deploy/${id}`, method: 'post' })

/** 管理员分页查询所有用户的应用。 */
export const adminPageApps = (params: AppAdminPageQuery) =>
  request<PageResult<AppVO>>({ url: '/app/admin/page', method: 'get', params })

/** 管理员批量保存应用修改和删除操作。 */
export const batchSaveAdminApps = (data: DataContainer<AppBatchSaveRequest>) =>
  request<boolean>({ url: '/app/admin/batchSave', method: 'post', data })
