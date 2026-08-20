import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getLoginUser, type UserVO } from '../api/user'
import { UserContext } from './userContext'

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserVO | null>(null)
  const [loading, setLoading] = useState(true)

  /** 拉取当前登录用户，失败或未登录时置为 null */
  const fetchLoginUser = useCallback(async () => {
    try {
      const user = await getLoginUser()
      setCurrentUser(user)
      return user
    } catch {
      setCurrentUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setCurrentUser(null)
  }, [])

  useEffect(() => {
    let active = true
    // 应用启动时恢复登录态（刷新页面后仍正确）
    getLoginUser()
      .then((user) => {
        if (active) setCurrentUser(user)
      })
      .catch(() => {
        if (active) setCurrentUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <UserContext.Provider value={{ currentUser, loading, fetchLoginUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}
