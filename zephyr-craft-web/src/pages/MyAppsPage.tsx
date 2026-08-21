import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import {
  APP_PRIORITY,
  deployApp,
  pageMyApps,
  removeMyApp,
  updateMyApp,
  type AppVO
} from '../api/app'
import { useUser } from '../store/useUser'
import TopNav from '../components/TopNav'
import Modal from '../components/admin/Modal'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import AppRenameModal from '../components/AppRenameModal'

const PAGE_SIZE = 12

interface Toast {
  type: 'success' | 'error'
  message: string
}

interface DeployResult {
  appName: string
  url: string
}

/** 格式化后端 LocalDateTime 字符串（2026-08-19T17:38:59 → 2026-08-19 17:38） */
const formatDateTime = (value: string | null | undefined) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

export default function MyAppsPage() {
  const reduceMotion = useReducedMotion()
  const { currentUser, loading: userLoading } = useUser()

  const [records, setRecords] = useState<AppVO[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [renameTarget, setRenameTarget] = useState<AppVO | null>(null)
  const [renameError, setRenameError] = useState('')
  const [renaming, setRenaming] = useState(false)

  const [removeTarget, setRemoveTarget] = useState<AppVO | null>(null)
  const [removing, setRemoving] = useState(false)

  const [deployingId, setDeployingId] = useState<string | null>(null)
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null)

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
    // 首次加载、分页切换、搜索与手动刷新：在异步回调中更新状态
    pageMyApps({ current: page, pageSize: PAGE_SIZE, appName: appliedName || undefined })
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
        if (active) setListLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, appliedName, refreshKey])

  /** 手动刷新当前页（事件处理器中调用） */
  const refresh = useCallback(() => {
    setListLoading(true)
    setLoadError('')
    setRefreshKey((key) => key + 1)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  /** 分页切换：先置加载态再更新页码，避免界面闪烁旧数据 */
  const changePage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return
    setListLoading(true)
    setLoadError('')
    setPage(next)
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const name = searchText.trim()
    setListLoading(true)
    setLoadError('')
    setPage(1)
    setAppliedName(name)
    setRefreshKey((key) => key + 1)
  }

  const handleRename = async (values: { id: string; appName: string }) => {
    setRenaming(true)
    setRenameError('')
    try {
      await updateMyApp(values)
      setRenameTarget(null)
      showToast({ type: 'success', message: '应用名称已更新' })
      refresh()
    } catch (error) {
      setRenameError(error instanceof BusinessError ? error.message : '保存失败，请稍后重试')
    } finally {
      setRenaming(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeMyApp(removeTarget.id)
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

  const handleDeploy = async (app: AppVO) => {
    if (deployingId) return
    setDeployingId(app.id)
    try {
      const url = await deployApp(app.id)
      setDeployResult({ appName: app.appName, url })
      refresh()
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof BusinessError ? error.message : '部署失败，请稍后重试'
      })
    } finally {
      setDeployingId(null)
    }
  }

  const handleCopyUrl = async () => {
    if (!deployResult) return
    try {
      await navigator.clipboard.writeText(deployResult.url)
      showToast({ type: 'success', message: '访问地址已复制' })
    } catch {
      showToast({ type: 'error', message: '复制失败，请手动选择复制' })
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

  return (
    <div className="page-glow flex h-dvh flex-col overflow-hidden">
      <TopNav />

      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
          {/* 页头与搜索 */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-ink">我的应用</h1>
              <p className="mt-1 text-sm text-ink-muted">查看你生成的网站应用，可重命名、部署或删除</p>
            </div>
            <form className="flex w-full max-w-sm gap-2" onSubmit={handleSearch} role="search">
              <label htmlFor="app-search" className="sr-only">
                按应用名称搜索
              </label>
              <input
                id="app-search"
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索应用名称"
                className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand"
              />
              <button
                type="submit"
                className="h-10 shrink-0 cursor-pointer rounded-full bg-brand px-5 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                搜索
              </button>
            </form>
          </div>

          {/* 加载骨架屏 */}
          {listLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="aspect-[16/10] animate-pulse bg-mist" aria-hidden="true" />
                  <div className="space-y-2.5 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-mist" aria-hidden="true" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-mist" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 错误态 */}
          {!listLoading && loadError && (
            <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center shadow-sm shadow-brand/5">
              <p className="text-sm text-ink-muted">{loadError}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-3 cursor-pointer rounded-full border border-line px-5 py-2 text-sm text-brand transition-colors duration-200 hover:border-brand/40 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
              >
                重新加载
              </button>
            </div>
          )}

          {/* 空态 */}
          {!listLoading && !loadError && records.length === 0 && (
            <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center shadow-sm shadow-brand/5">
              <p className="text-sm text-ink-muted">
                {appliedName ? '没有找到匹配的应用' : '你还没有生成过应用'}
              </p>
              {!appliedName && (
                <Link
                  to="/"
                  className="mt-3 inline-block cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors duration-200 hover:bg-brand-dark"
                >
                  去创建第一个网站
                </Link>
              )}
            </div>
          )}

          {/* 卡片网格 */}
          {!listLoading && !loadError && records.length > 0 && (
            <>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {records.map((app, index) => (
                  <motion.li
                    key={app.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-brand/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
                      {/* 封面 */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-mist">
                        {app.cover ? (
                          <img src={app.cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/75 to-brand-deep"
                          >
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-white/85">
                              <rect x="3" y="4.5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.6" />
                              <circle cx="6" cy="6.5" r="0.8" fill="currentColor" />
                              <circle cx="8.6" cy="6.5" r="0.8" fill="currentColor" />
                            </svg>
                          </div>
                        )}
                        {app.priority === APP_PRIORITY.FEATURED && (
                          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow-sm">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
                            </svg>
                            精选
                          </span>
                        )}
                      </div>

                      {/* 信息 */}
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="truncate text-sm font-semibold text-ink" title={app.appName}>
                          {app.appName}
                        </h3>
                        <p className="mt-1 text-xs text-ink-muted tabular-nums">
                          创建于 {formatDateTime(app.createTime)}
                        </p>
                        {app.deployedTime && (
                          <p className="mt-0.5 text-xs text-emerald-600 tabular-nums">
                            最近部署 {formatDateTime(app.deployedTime)}
                          </p>
                        )}

                        {/* 操作 */}
                        <div className="mt-3 flex items-center gap-1.5 border-t border-line/60 pt-3">
                          <button
                            type="button"
                            onClick={() => handleDeploy(app)}
                            disabled={deployingId !== null}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand/10 px-2 py-1.5 text-xs font-medium text-brand transition-colors duration-150 hover:bg-brand/20 focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deployingId === app.id ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
                                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                                部署中…
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M4.5 15.5v2.5A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                部署
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRenameError('')
                              setRenameTarget(app)
                            }}
                            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors duration-150 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                          >
                            重命名
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemoveTarget(app)}
                            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-red-600 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </article>
                  </motion.li>
                ))}
              </ul>

              {/* 分页 */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-ink-muted tabular-nums">
                  共 {total} 个应用 · 第 {page}/{totalPages} 页
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                    className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.main>

      {/* 弹窗 */}
      {renameTarget && (
        <AppRenameModal
          app={renameTarget}
          serverError={renameError}
          submitting={renaming}
          onSubmit={handleRename}
          onClose={() => setRenameTarget(null)}
        />
      )}
      {removeTarget && (
        <ConfirmDialog
          title="删除应用"
          message={`确定要删除应用「${removeTarget.appName}」吗？删除后已部署的访问地址也将失效。`}
          confirmText="确认删除"
          loading={removing}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
      {deployResult && (
        <Modal title="部署成功" onClose={() => setDeployResult(null)}>
          <p className="text-sm text-ink-muted">
            应用「{deployResult.appName}」已发布，可通过以下地址访问：
          </p>
          <p className="mt-3 break-all rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-sm text-brand">
            {deployResult.url}
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors duration-200 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand"
            >
              复制地址
            </button>
            <a
              href={deployResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 cursor-pointer items-center rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              打开链接
            </a>
          </div>
        </Modal>
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
