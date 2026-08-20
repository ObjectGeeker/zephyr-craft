import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import {
  adminCreateUser,
  adminPageUsers,
  adminRemoveUser,
  adminUpdateUser,
  type UserUpdateRequest,
  type UserVO
} from '../api/user'
import { useUser } from '../store/useUser'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import UserCreateModal, { type UserCreateValues } from '../components/admin/UserCreateModal'
import UserEditModal from '../components/admin/UserEditModal'

const PAGE_SIZE = 10

interface Toast {
  type: 'success' | 'error'
  message: string
}

/** 格式化后端 LocalDateTime 字符串（2026-08-19T17:38:59 → 2026-08-19 17:38） */
const formatDateTime = (value: string | null | undefined) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

export default function AdminPage() {
  const reduceMotion = useReducedMotion()
  const { currentUser, loading: userLoading } = useUser()

  const [records, setRecords] = useState<UserVO[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tableLoading, setTableLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [editTarget, setEditTarget] = useState<UserVO | null>(null)
  const [editError, setEditError] = useState('')
  const [editing, setEditing] = useState(false)

  const [removeTarget, setRemoveTarget] = useState<UserVO | null>(null)
  const [removing, setRemoving] = useState(false)

  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((next: Toast) => {
    setToast(next)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  /** 手动刷新当前页（事件处理器中调用） */
  const loadUsers = useCallback((targetPage: number) => {
    setTableLoading(true)
    setLoadError('')
    adminPageUsers({ current: targetPage, pageSize: PAGE_SIZE })
      .then((result) => {
        setRecords(result.records || [])
        setTotal(result.total)
      })
      .catch((error) => {
        setRecords([])
        setLoadError(error instanceof BusinessError ? error.message : '加载失败，请稍后重试')
      })
      .finally(() => setTableLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    // 首次加载与分页切换：在异步回调中更新状态
    adminPageUsers({ current: page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (!active) return
        setRecords(result.records || [])
        setTotal(result.total)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return
        setRecords([])
        setLoadError(error instanceof BusinessError ? error.message : '加载失败，请稍后重试')
      })
      .finally(() => {
        if (active) setTableLoading(false)
      })
    return () => {
      active = false
    }
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  /** 分页切换：先置加载态再更新页码，避免界面闪烁旧数据 */
  const changePage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return
    setTableLoading(true)
    setLoadError('')
    setPage(next)
  }

  const handleCreate = async (values: UserCreateValues) => {
    setCreating(true)
    setCreateError('')
    try {
      await adminCreateUser(values)
      setCreateOpen(false)
      showToast({ type: 'success', message: `用户 ${values.account} 创建成功` })
      loadUsers(page)
    } catch (error) {
      setCreateError(error instanceof BusinessError ? error.message : '创建失败，请稍后重试')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async (values: UserUpdateRequest) => {
    setEditing(true)
    setEditError('')
    try {
      await adminUpdateUser(values)
      setEditTarget(null)
      showToast({ type: 'success', message: '用户资料已更新' })
      loadUsers(page)
    } catch (error) {
      setEditError(error instanceof BusinessError ? error.message : '保存失败，请稍后重试')
    } finally {
      setEditing(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await adminRemoveUser(removeTarget.id)
      showToast({ type: 'success', message: `用户 ${removeTarget.account} 已删除` })
      setRemoveTarget(null)
      // 删除当前页最后一条时回退一页
      if (records.length === 1 && page > 1) {
        changePage(page - 1)
      } else {
        loadUsers(page)
      }
    } catch (error) {
      setRemoveTarget(null)
      showToast({
        type: 'error',
        message: error instanceof BusinessError ? error.message : '删除失败，请稍后重试'
      })
    } finally {
      setRemoving(false)
    }
  }

  // ---------- 权限守卫 ----------
  if (userLoading) {
    return (
      <div className="page-glow flex h-dvh items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin text-brand">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="sr-only">正在校验登录状态</span>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="page-glow flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">无权访问</h1>
        <p className="text-sm text-ink-muted">当前账号不是管理员，无法进入后台管理。</p>
        <Link
          to="/"
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors duration-200 hover:bg-brand-dark"
        >
          返回主页
        </Link>
      </div>
    )
  }

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

        <nav className="flex-1 px-3 py-2" aria-label="后台导航">
          <span
            aria-current="page"
            className="flex items-center gap-2.5 rounded-xl bg-mist px-3.5 py-2.5 text-sm font-medium text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3.5 19c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2M17.8 15.4c1.5.6 2.5 1.9 3 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            用户管理
          </span>
        </nav>

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
      </aside>

      {/* 主内容区 */}
      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
      >
        {/* 页头 */}
        <header className="flex shrink-0 items-center justify-between border-b border-line/70 bg-white/80 px-6 py-4 backdrop-blur-sm lg:px-8">
          <div>
            <h1 className="text-lg font-semibold text-ink">用户管理</h1>
            <p className="mt-0.5 text-xs text-ink-muted">管理平台账号，支持新增、编辑与删除用户</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreateError('')
              setCreateOpen(true)
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.98]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            新增用户
          </button>
        </header>

        {/* 表格区 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-brand/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-mist/60 text-xs text-ink-muted">
                    <th scope="col" className="px-5 py-3.5 font-medium">用户</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">角色</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">个人简介</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">注册时间</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-line/60 last:border-b-0">
                        {Array.from({ length: 5 }).map((__, cell) => (
                          <td key={cell} className="px-5 py-4">
                            <div className="h-4 w-full max-w-28 animate-pulse rounded bg-mist" aria-hidden="true" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!tableLoading && loadError && (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <p className="text-sm text-ink-muted">{loadError}</p>
                        <button
                          type="button"
                          onClick={() => loadUsers(page)}
                          className="mt-3 cursor-pointer rounded-full border border-line px-5 py-2 text-sm text-brand transition-colors duration-200 hover:border-brand/40 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          重新加载
                        </button>
                      </td>
                    </tr>
                  )}

                  {!tableLoading && !loadError && records.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <p className="text-sm text-ink-muted">暂无用户数据</p>
                        <button
                          type="button"
                          onClick={() => setCreateOpen(true)}
                          className="mt-3 cursor-pointer rounded-full border border-line px-5 py-2 text-sm text-brand transition-colors duration-200 hover:border-brand/40 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          创建第一个用户
                        </button>
                      </td>
                    </tr>
                  )}

                  {!tableLoading &&
                    !loadError &&
                    records.map((user) => (
                      <tr key={user.id} className="border-b border-line/60 transition-colors duration-150 last:border-b-0 hover:bg-mist/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-xs font-semibold text-white"
                              >
                                {(user.username || user.account).slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{user.username || user.account}</p>
                              <p className="truncate text-xs text-ink-muted">{user.account}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
                              </svg>
                              管理员
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink-muted">
                              普通用户
                            </span>
                          )}
                        </td>
                        <td className="max-w-56 px-5 py-3.5">
                          <p className="truncate text-ink-muted" title={user.profile || ''}>
                            {user.profile || '-'}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-ink-muted tabular-nums">{formatDateTime(user.createTime)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditError('')
                                setEditTarget(user)
                              }}
                              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-brand transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(user)}
                              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {!tableLoading && !loadError && records.length > 0 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                <p className="text-xs text-ink-muted tabular-nums">
                  共 {total} 位用户 · 第 {page}/{totalPages} 页
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                    className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.main>

      {/* 弹窗 */}
      {createOpen && (
        <UserCreateModal
          serverError={createError}
          submitting={creating}
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editTarget && (
        <UserEditModal
          user={editTarget}
          serverError={editError}
          submitting={editing}
          onSubmit={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {removeTarget && (
        <ConfirmDialog
          title="删除用户"
          message={`确定要删除用户「${removeTarget.account}」吗？删除后该账号将无法登录平台。`}
          confirmText="确认删除"
          loading={removing}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {/* Toast 反馈 */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-5 z-[60] flex justify-center">
        {toast && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
              </svg>
            )}
            {toast.message}
          </motion.div>
        )}
      </div>
    </div>
  )
}
