import { useContext } from 'react'
import { UserContext } from './userContext'

/** 获取当前登录态上下文，必须在 UserProvider 内使用。 */
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser 必须在 UserProvider 内使用')
  }
  return context
}
