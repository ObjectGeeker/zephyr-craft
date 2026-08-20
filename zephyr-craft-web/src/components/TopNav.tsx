import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { logout } from '../api/user'
import { useUser } from '../store/useUser'

const NAV_LINKS = ['功能', '案例', '文档']

export default function TopNav() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const { currentUser, loading, clearUser } = useUser()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleStart = () => {
    navigate(currentUser ? '/' : '/login')
  }

  const handleLogout = async () => {
    if (logoutLoading) return
    setLogoutLoading(true)
    try {
      await logout()
    } catch {
      // 退出失败时仍清除本地登录态，避免界面卡在已注销会话
    } finally {
      clearUser()
      setLogoutLoading(false)
    }
  }

  const avatarText = (currentUser?.username || currentUser?.account || '?').slice(0, 1).toUpperCase()

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-line/70 bg-white/80 px-6 backdrop-blur-sm lg:px-12"
    >
      <a href="/" className="flex cursor-pointer items-center gap-2.5" aria-label="Zephyr Craft 首页">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-sm shadow-brand/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3.5 12.5 12 3l3 7.5L20.5 9 12 21l-2-6.5-6.5-2Z"
              fill="white"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-ink">
          Zephyr<span className="text-brand"> Craft</span>
        </span>
      </a>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="主导航">
        {NAV_LINKS.map((label, index) => (
          <a
            key={label}
            href="#"
            className={`hidden cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand md:block ${
              index === 1 ? 'sm:block' : ''
            }`}
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={handleStart}
          className="ml-2 cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          开始创作
        </button>

        {!loading && !currentUser && (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="ml-2 cursor-pointer rounded-full border border-line bg-white/80 px-5 py-2 text-sm font-medium text-ink transition-all duration-200 hover:border-brand/40 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            登录 / 注册
          </button>
        )}

        {currentUser && (
          <div className="dropdown dropdown-end ml-2">
            <button
              type="button"
              tabIndex={0}
              aria-label={`当前用户：${currentUser.username || currentUser.account}`}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pr-3.5 pl-1.5 transition-all duration-200 hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-xs font-semibold text-white"
                >
                  {avatarText}
                </span>
              )}
              <span className="max-w-24 truncate text-sm text-ink">
                {currentUser.username || currentUser.account}
              </span>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-20 mt-2 w-44 rounded-xl border border-line bg-white p-1.5 shadow-lg shadow-brand/10"
            >
              {currentUser.role === 'admin' && (
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    后台管理
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-red-600 focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {logoutLoading ? '退出中…' : '退出登录'}
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </motion.header>
  )
}
