import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import {
  APP_PRIORITY,
  adminPageApps,
  batchSaveAdminApps,
  type AppBatchSaveRequest,
  type AppVO,
  type DataContainer
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

const emptyChanges = (): DataContainer<AppBatchSaveRequest> => ({
  createData: [],
  modifyData: [],
  removeData: []
})

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
  const [changes, setChanges] = useState<DataContainer<AppBatchSaveRequest>>(emptyChanges)
  const [saving, setSaving] = useState(false)

  const [editTarget, setEditTarget] = useState<AppVO | null>(null)
  const [removeTarget, setRemoveTarget] = useState<AppVO | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pendingCount = changes.modifyData.length + changes.removeData.length
  const hasPendingChanges = pendingCount > 0

  const displayedApps = useMemo(() => {
    const removedIds = new Set(changes.removeData.map((item) => item.id))
    const modifiedApps = new Map(changes.modifyData.map((item) => [item.id, item]))
    return records
      .filter((app) => !removedIds.has(app.id))
      .map((app) => {
        const change = modifiedApps.get(app.id)
        return change
          ? {
              ...app,
              appName: change.appName ?? app.appName,
              cover: change.cover ?? app.cover,
              priority: change.priority ?? app.priority
            }
          : app
      })
  }, [changes.modifyData, changes.removeData, records])

  const refresh = useCallback(() => {
    if (saving) return
    setTableLoading(true)
    setLoadError('')
    setRefreshKey((key) => key + 1)
  }, [saving])

  const changePage = (next: number) => {
    if (saving || next < 1 || next > totalPages || next === page) return
    setTableLoading(true)
    setLoadError('')
    setPage(next)
  }

  const handleFilter = (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    setTableLoading(true)
    setLoadError('')
    setPage(1)
    setAppliedName(searchText.trim())
    setAppliedStatus(statusFilter)
    setRefreshKey((key) => key + 1)
  }

  const stageModification = (values: AppBatchSaveRequest) => {
    if (!values.id) return
    setChanges((previous) => ({
      ...previous,
      modifyData: [...previous.modifyData.filter((item) => item.id !== values.id), values]
    }))
  }

  const handleEdit = (values: AppBatchSaveRequest) => {
    stageModification(values)
    setEditTarget(null)
    showToast({ type: 'success', message: '应用修改已加入待保存更改' })
  }

  const handleToggleFeatured = (app: AppVO) => {
    stageModification({
      id: app.id,
      priority: app.priority === APP_PRIORITY.FEATURED ? APP_PRIORITY.NORMAL : APP_PRIORITY.FEATURED
    })
    showToast({
      type: 'success',
      message: app.priority === APP_PRIORITY.FEATURED ? '取消精选已加入待保存更改' : '设为精选已加入待保存更改'
    })
  }

  const handleRemove = () => {
    if (!removeTarget) return
    setChanges((previous) => ({
      ...previous,
      modifyData: previous.modifyData.filter((item) => item.id !== removeTarget.id),
      removeData: [...previous.removeData.filter((item) => item.id !== removeTarget.id), { id: removeTarget.id }]
    }))
    setRemoveTarget(null)
    showToast({ type: 'success', message: '删除操作已加入待保存更改' })
  }

  const discardChanges = () => {
    setChanges(emptyChanges())
    setDiscardOpen(false)
    refresh()
    showToast({ type: 'success', message: '已放弃全部待保存更改' })
  }

  const saveChanges = async () => {
    if (!hasPendingChanges || saving) return
    setSaving(true)
    try {
      await batchSaveAdminApps(changes)
      const remainingTotal = Math.max(0, total - changes.removeData.length)
      const targetPage = Math.min(page, Math.max(1, Math.ceil(remainingTotal / PAGE_SIZE)))
      setChanges(emptyChanges())
      showToast({ type: 'success', message: '全部更改已保存' })
      if (targetPage === page) {
        setTableLoading(true)
        setRefreshKey((key) => key + 1)
      } else {
        setTableLoading(true)
        setPage(targetPage)
      }
    } catch (error) {
      showToast({ type: 'error', message: error instanceof BusinessError ? error.message : '保存失败，请稍后重试' })
    } finally {
      setSaving(false)
    }
  }

  if (userLoading) {
    return (
      <div className="page-glow flex h-dvh items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin text-brand">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />

  if (currentUser.role !== 'admin') {
    return (
      <div className="page-glow flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">无权访问</h1>
        <p className="text-sm text-ink-muted">当前账号不是管理员，无法进入后台管理。</p>
        <Link to="/" className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand/30 hover:bg-brand-dark">返回主页</Link>
      </div>
    )
  }

  return (
    <AdminLayout>
      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
      >
        <header className="flex shrink-0 flex-col gap-3 border-b border-line/70 bg-white/80 px-6 py-4 backdrop-blur-sm lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-ink">应用管理</h1>
              <p className="mt-0.5 text-xs text-ink-muted">管理所有用户生成的应用，编辑、精选和删除会暂存后一次保存</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasPendingChanges && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">待保存：修改 {changes.modifyData.length} · 删除 {changes.removeData.length}</span>}
              {hasPendingChanges && <button type="button" onClick={() => setDiscardOpen(true)} disabled={saving} className="h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60">放弃全部更改</button>}
              <button type="button" onClick={saveChanges} disabled={!hasPendingChanges || saving} className="h-10 cursor-pointer rounded-full bg-brand px-4 text-sm font-medium text-white shadow-sm shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{saving ? '保存中…' : '保存全部更改'}</button>
            </div>
          </div>
          <form className="flex w-full max-w-xl gap-2" onSubmit={handleFilter} role="search">
            <label htmlFor="admin-app-search" className="sr-only">按应用名称搜索</label>
            <input id="admin-app-search" type="text" value={searchText} disabled={saving} onChange={(event) => setSearchText(event.target.value)} placeholder="搜索应用名称" className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-brand disabled:opacity-60" />
            <label htmlFor="admin-app-status" className="sr-only">按精选状态筛选</label>
            <select id="admin-app-status" value={statusFilter} disabled={saving} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 shrink-0 cursor-pointer rounded-full border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-60">
              <option value="all">全部状态</option><option value="featured">仅精选</option><option value="normal">仅普通</option>
            </select>
            <button type="submit" disabled={saving} className="h-10 shrink-0 cursor-pointer rounded-full bg-brand px-5 text-sm font-medium text-white shadow-sm shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">筛选</button>
          </form>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-brand/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead><tr className="border-b border-line bg-mist/60 text-xs text-ink-muted"><th className="px-5 py-3.5 font-medium">应用</th><th className="px-5 py-3.5 font-medium">创建者</th><th className="px-5 py-3.5 font-medium">生成方式</th><th className="px-5 py-3.5 font-medium">状态</th><th className="px-5 py-3.5 font-medium">创建时间</th><th className="px-5 py-3.5 text-right font-medium">操作</th></tr></thead>
                <tbody>
                  {tableLoading && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-ink-muted">正在加载应用…</td></tr>}
                  {!tableLoading && loadError && <tr><td colSpan={6} className="px-5 py-14 text-center"><p className="text-sm text-ink-muted">{loadError}</p><button type="button" onClick={refresh} className="mt-3 cursor-pointer rounded-full border border-line px-5 py-2 text-sm text-brand hover:border-brand/40 hover:bg-mist">重新加载</button></td></tr>}
                  {!tableLoading && !loadError && displayedApps.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-ink-muted">暂无应用数据</td></tr>}
                  {!tableLoading && !loadError && displayedApps.map((app) => {
                    const featured = app.priority === APP_PRIORITY.FEATURED
                    const isModified = changes.modifyData.some((item) => item.id === app.id)
                    return (
                      <tr key={app.id} className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-mist/40">
                        <td className="px-5 py-3.5"><div className="flex items-center gap-3">{app.cover ? <img src={app.cover} alt="" className="h-10 w-16 shrink-0 rounded-lg border border-line object-cover" /> : <span aria-hidden="true" className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/75 to-brand-deep text-white/85">▣</span>}<div className="min-w-0"><p className="truncate font-medium text-ink" title={app.appName}>{app.appName}</p><p className="truncate text-xs text-ink-muted/70">{app.id}</p></div></div></td>
                        <td className="px-5 py-3.5">{app.user ? <div className="min-w-0"><p className="truncate text-ink">{app.user.username || app.user.account}</p><p className="truncate text-xs text-ink-muted">{app.user.account}</p></div> : <span className="text-ink-muted">-</span>}</td>
                        <td className="px-5 py-3.5 text-ink-muted">{app.codeGenType || '-'}</td>
                        <td className="px-5 py-3.5">{isModified ? <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">待修改</span> : featured ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">精选</span> : <span className="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink-muted">普通</span>}</td>
                        <td className="px-5 py-3.5 text-ink-muted tabular-nums">{formatDateTime(app.createTime)}</td>
                        <td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button type="button" onClick={() => setEditTarget(app)} disabled={saving} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-brand hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60">编辑</button><button type="button" onClick={() => handleToggleFeatured(app)} disabled={saving} className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${featured ? 'text-ink-muted hover:bg-mist hover:text-ink' : 'text-amber-600 hover:bg-amber-50'}`}>{featured ? '取消加精' : '加精'}</button><button type="button" onClick={() => setRemoveTarget(app)} disabled={saving} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">删除</button></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!tableLoading && !loadError && displayedApps.length > 0 && <div className="flex items-center justify-between border-t border-line px-5 py-3.5"><p className="text-xs text-ink-muted tabular-nums">共 {total} 个应用 · 第 {page}/{totalPages} 页</p><div className="flex items-center gap-2"><button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1 || saving} className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-sm text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40">上一页</button><button type="button" onClick={() => changePage(page + 1)} disabled={page >= totalPages || saving} className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-sm text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40">下一页</button></div></div>}
          </div>
        </div>
      </motion.main>

      {editTarget && <AppEditModal app={editTarget} serverError="" submitting={saving} onSubmit={handleEdit} onClose={() => setEditTarget(null)} />}
      {removeTarget && <ConfirmDialog title="删除应用" message={`确定将应用「${removeTarget.appName}」加入待删除更改吗？`} confirmText="加入待删除" loading={saving} onConfirm={handleRemove} onCancel={() => setRemoveTarget(null)} />}
      {discardOpen && <ConfirmDialog title="放弃全部更改" message="所有未保存的应用修改和删除操作都会丢失，是否继续？" confirmText="放弃更改" loading={saving} onConfirm={discardChanges} onCancel={() => setDiscardOpen(false)} />}
      {toast && <div role="status" className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
    </AdminLayout>
  )
}
