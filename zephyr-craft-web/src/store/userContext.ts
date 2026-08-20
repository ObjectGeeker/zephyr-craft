import { createContext } from 'react'
import type { UserVO } from '../api/user'

export interface UserContextValue {
  /** 当前登录用户，未登录为 null */
  currentUser: UserVO | null
  /** 登录态初始化是否完成 */
  loading: boolean
  /** 拉取当前登录用户，失败或未登录时置为 null */
  fetchLoginUser: () => Promise<UserVO | null>
  /** 清除本地登录态（退出登录后调用） */
  clearUser: () => void
}

export const UserContext = createContext<UserContextValue | null>(null)
