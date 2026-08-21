import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../../store/useUser'

const NAV_ITEMS = [
  { path: '/admin', label: '用户管理' },
  { path: '/admin/apps', label: '应用管理' }
]

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * 后台管理共享布局：侧边栏（Logo、模块导航、当前管理员信息与返回前台）+ 主内容区。
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const { currentUser } = useUser()
  const { pathname } = useLocation()

  return (
    <div className="page-glow flex h-dvh overflow-hidden">
      {/* 侧边栏（桌面端） */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line/70 bg-white/80 backdrop-blur-sm md:flex">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5" aria-label="返回 Zephyr Craft 首页">
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
          <span className="text-base font-semibold tracking-tight text-ink">
            Zephyr<span className="text-brand"> Craft</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="后台导航">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-brand ${
                  active ? 'bg-mist text-brand' : 'text-ink-muted hover:bg-mist/60 hover:text-ink'
                }`}
              >
                {item.label === '用户管理' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M3.5 19c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2M17.8 15.4c1.5.6 2.5 1.9 3 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                )}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {currentUser && (
          <div className="border-t border-line/70 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-sm font-semibold text-white">
                {(currentUser.username || currentUser.account).slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{currentUser.username || currentUser.account}</p>
                <p className="text-xs text-ink-muted">管理员</p>
              </div>
            </div>
            <Link
              to="/"
              className="mt-3 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 4.5 7.5 12l7.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              返回前台
            </Link>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      {children}
    </div>
  )
}
