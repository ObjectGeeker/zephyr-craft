/**
 * 与后端 BaseResponse<T> 对齐的通用响应结构。
 */
export interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 与后端 PageResult<T> 对齐的分页结构。
 */
export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  pageSize: number
}

/** 后端错误码，与 ErrorCode 枚举保持一致。 */
export const ResponseCode = {
  SUCCESS: 0,
  PARAMS_ERROR: 40000,
  NOT_LOGIN_ERROR: 40100,
  FORBIDDEN_ERROR: 40300,
  NOT_FOUND_ERROR: 40400,
  SYSTEM_ERROR: 50000,
  OPERATION_ERROR: 50001
} as const
