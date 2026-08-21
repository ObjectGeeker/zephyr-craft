import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import {
  APP_PRIORITY,
  adminPageApps,
  adminRemoveApp,
  adminUpdateApp,
  type AppAdminUpdateRequest,
  type AppVO
} from '../api/app'
import { useUser } from '../store/useUser'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import AppEditModal from '../components/admin/AppEditModal'

const PAGE_SIZE = 10

type StatusFilter = 'all' | 'featured' | 'normal'

interface Toast {
  type: 'success' | 'error'
  message: string
}

/** 格式化后端 LocalDateTime 字符串（2026-08-19T17:38:59 → 2026-08-19 17:38） */
const formatDateTime = (value: string | null | undefined) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

export default function AdminAppsPage() {
  const reduceMotion = useReducedMotion()
  const { currentUser, loading: userLoading } = useUser()

  const [records, setRecords] = useState<AppVO[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [tableLoading, setTableLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [editTarget, setEditTarget] = useState<AppVO | null>(null)
  const [editError, setEditError] = useState('')
  const [editing, setEditing] = useState(false)

  const [removeTarget, setRemoveTarget] = useState<AppVO | null>(null)
  const [removing, setRemoving] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  useEffect(() => {
    let active = true
    // 首次加载、分页切换、筛选与手动刷新：在异步回调中更新状态
    const priority =
      appliedStatus === 'featured'
        ? APP_PRIORITY.FEATURED
        : appliedStatus === 'normal'
          ? APP_PRIORITY.NORMAL
          : undefined
    adminPageApps({ current: page, pageSize: PAGE_SIZE, appName: appliedName || undefined, priority })
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
  }, [page, appliedName, appliedStatus, refreshKey])

  /** 手动刷新当前页（事件处理器中调用） */
  const refresh = useCallback(() => {
    setTableLoading(true)
    setLoadError('')
    setRefreshKey((key) => key + 1)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  /** 分页切换：先置加载态再更新页码，避免界面闪烁旧数据 */
  const changePage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return
    setTableLoading(true)
    setLoadError('')
    setPage(next)
  }

  const handleFilter = (event: FormEvent) => {
    event.preventDefault()
    setTableLoading(true)
    setLoadError('')
    setPage(1)
    setAppliedName(searchText.trim())
    setAppliedStatus(statusFilter)
    setRefreshKey((key) => key + 1)
  }

  const handleEdit = async (values: AppAdminUpdateRequest) => {
    setEditing(true)
    setEditError('')
    try {
      await adminUpdateApp(values)
      setEditTarget(null)
      showToast({ type: 'success', message: '应用信息已更新' })
      refresh()
    } catch (error) {
      setEditError(error instanceof BusinessError ? error.message : '保存失败，请稍后重试')
    } finally {
      setEditing(false)
    }
  }

  const handleToggleFeatured = async (app: AppVO) => {
    if (togglingId) return
    const featured = app.priority === APP_PRIORITY.FEATURED
    setTogglingId(app.id)
    try {
      await adminUpdateApp({ id: app.id, priority: featured ? APP_PRIORITY.NORMAL : APP_PRIORITY.FEATURED })
      showToast({
        type: 'success',
        message: featured ? `已取消「${app.appName}」的精选` : `已将「${app.appName}」设为精选`
      })
      refresh()
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof BusinessError ? error.message : '操作失败，请稍后重试'
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await adminRemoveApp(removeTarget.id)
      showToast({ type: 'success', message: `应用「${removeTarget.appName}」已删除` })
      setRemoveTarget(null)
      // 删除当前页最后一条时回退一页
      if (records.length === 1 && page > 1) {
        changePage(page - 1)
      } else {
        refresh()
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
    <AdminLayout>
      {/* 主内容区 */}
      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
      >
        {/* 页头与筛选 */}
        <header className="flex shrink-0 flex-col gap-3 border-b border-line/70 bg-white/80 px-6 py-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h1 className="text-lg font-semibold text-ink">应用管理</h1>
            <p className="mt-0.5 text-xs text-ink-muted">管理所有用户生成的应用，支持编辑、删除与加精</p>
          </div>
          <form className="flex w-full max-w-xl gap-2" onSubmit={handleFilter} role="search">
            <label htmlFor="admin-app-search" className="sr-only">
              按应用名称搜索
            </label>
            <input
              id="admin-app-search"
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索应用名称"
              className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand"
            />
            <label htmlFor="admin-app-status" className="sr-only">
              按精选状态筛选
            </label>
            <select
              id="admin-app-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-10 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-brand"
            >
              <option value="all">全部状态</option>
              <option value="featured">仅精选</option>
              <option value="normal">仅普通</option>
            </select>
            <button
              type="submit"
              className="h-10 shrink-0 cursor-pointer rounded-full bg-brand px-5 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              筛选
            </button>
          </form>
        </header>

        {/* 表格区 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-brand/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-mist/60 text-xs text-ink-muted">
                    <th scope="col" className="px-5 py-3.5 font-medium">应用</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">创建者</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">生成方式</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">状态</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">创建时间</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-line/60 last:border-b-0">
                        {Array.from({ length: 6 }).map((__, cell) => (
                          <td key={cell} className="px-5 py-4">
                            <div className="h-4 w-full max-w-28 animate-pulse rounded bg-mist" aria-hidden="true" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!tableLoading && loadError && (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <p className="text-sm text-ink-muted">{loadError}</p>
                        <button
                          type="button"
                          onClick={refresh}
                          className="mt-3 cursor-pointer rounded-full border border-line px-5 py-2 text-sm text-brand transition-colors duration-200 hover:border-brand/40 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          重新加载
                        </button>
                      </td>
                    </tr>
                  )}

                  {!tableLoading && !loadError && records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <p className="text-sm text-ink-muted">暂无应用数据</p>
                      </td>
                    </tr>
                  )}

                  {!tableLoading &&
                    !loadError &&
                    records.map((app) => {
                      const featured = app.priority === APP_PRIORITY.FEATURED
                      return (
                        <tr key={app.id} className="border-b border-line/60 transition-colors duration-150 last:border-b-0 hover:bg-mist/40">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {app.cover ? (
                                <img src={app.cover} alt="" className="h-10 w-16 shrink-0 rounded-lg border border-line object-cover" />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/75 to-brand-deep"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/85">
                                    <rect x="3" y="4.5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                    <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.6" />
                                  </svg>
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink" title={app.appName}>
                                  {app.appName}
                                </p>
                                <p className="truncate text-xs text-ink-muted/70">{app.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {app.user ? (
                              <div className="min-w-0">
                                <p className="truncate text-ink">{app.user.username || app.user.account}</p>
                                <p className="truncate text-xs text-ink-muted">{app.user.account}</p>
                              </div>
                            ) : (
                              <span className="text-ink-muted">-</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-ink-muted">{app.codeGenType || '-'}</td>
                          <td className="px-5 py-3.5">
                            {featured ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
                                </svg>
                                精选
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink-muted">
                                普通
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-ink-muted tabular-nums">{formatDateTime(app.createTime)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditError('')
                                  setEditTarget(app)
                                }}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-brand transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(app)}
                                disabled={togglingId !== null}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                  featured
                                    ? 'text-ink-muted hover:bg-mist hover:text-ink focus-visible:outline-brand'
                                    : 'text-amber-600 hover:bg-amber-50 focus-visible:outline-amber-600'
                                }`}
                              >
                                {togglingId === app.id ? '处理中…' : featured ? '取消加精' : '加精'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRemoveTarget(app)}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {!tableLoading && !loadError && records.length > 0 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                <p className="text-xs text-ink-muted tabular-nums">
                  共 {total} 个应用 · 第 {page}/{totalPages} 页
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
      {editTarget && (
        <AppEditModal
          app={editTarget}
          serverError={editError}
          submitting={editing}
          onSubmit={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {removeTarget && (
        <ConfirmDialog
          title="删除应用"
          message={`确定要删除应用「${removeTarget.appName}」吗？删除后该应用及其部署内容将无法访问。`}
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
    </AdminLayout>
  )
}
