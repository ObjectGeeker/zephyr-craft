import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import {
  adminPageUsers,
  batchSaveAdmin,
  type DataContainer,
  type UserBatchSaveRequest,
  type UserVO
} from '../api/user'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import UserCreateModal, { type UserCreateValues } from '../components/admin/UserCreateModal'
import UserEditModal from '../components/admin/UserEditModal'
import { useUser } from '../store/useUser'

const PAGE_SIZE = 10

interface Toast {
  type: 'success' | 'error'
  message: string
}

type CreateDraft = UserBatchSaveRequest & { id: string }

const emptyChanges = (): DataContainer<UserBatchSaveRequest> => ({
  createData: [],
  modifyData: [],
  removeData: []
})

const formatDateTime = (value: string | null | undefined) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

const createDraftId = () => `draft-${crypto.randomUUID()}`

export default function AdminPage() {
  const reduceMotion = useReducedMotion()
  const { currentUser, loading: userLoading } = useUser()
  const [records, setRecords] = useState<UserVO[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tableLoading, setTableLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [changes, setChanges] = useState<DataContainer<UserBatchSaveRequest>>(emptyChanges)
  const [createDrafts, setCreateDrafts] = useState<CreateDraft[]>([])
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UserVO | null>(null)
  const [removeTarget, setRemoveTarget] = useState<UserVO | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((next: Toast) => {
    setToast(next)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }, [])

  const loadUsers = useCallback(async (targetPage: number) => {
    setTableLoading(true)
    setLoadError('')
    try {
      const result = await adminPageUsers({ current: targetPage, pageSize: PAGE_SIZE })
      setRecords(result.records || [])
      setTotal(result.total)
    } catch (error) {
      setRecords([])
      setLoadError(error instanceof BusinessError ? error.message : '加载失败，请稍后重试')
    } finally {
      setTableLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
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

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const draftIds = useMemo(() => new Set(createDrafts.map((draft) => draft.id)), [createDrafts])
  const pendingCount = createDrafts.length + changes.modifyData.length + changes.removeData.length
  const hasPendingChanges = pendingCount > 0

  const displayedUsers = useMemo(() => {
    const removedIds = new Set(changes.removeData.map((item) => item.id))
    const modifiedUsers = new Map(changes.modifyData.map((item) => [item.id, item]))
    const pendingCreates: UserVO[] = createDrafts.map((draft) => ({
      id: draft.id,
      account: draft.account || '',
      username: draft.username || draft.account || '',
      avatar: draft.avatar || null,
      profile: draft.profile || null,
      role: 'user',
      createTime: '',
      updateTime: ''
    }))
    const persistedUsers = records
      .filter((user) => !removedIds.has(user.id))
      .map((user) => {
        const change = modifiedUsers.get(user.id)
        return change
          ? {
              ...user,
              username: change.username ?? user.username,
              avatar: change.avatar ?? user.avatar,
              profile: change.profile ?? user.profile
            }
          : user
      })
    return [...pendingCreates, ...persistedUsers]
  }, [changes.modifyData, changes.removeData, createDrafts, records])

  const changePage = (next: number) => {
    if (saving || next < 1 || next > totalPages || next === page) return
    setTableLoading(true)
    setLoadError('')
    setPage(next)
  }

  const refresh = () => {
    if (saving) return
    void loadUsers(page)
  }

  const handleCreate = (values: UserCreateValues) => {
    setCreateDrafts((drafts) => [...drafts, { ...values, id: createDraftId() }])
    setCreateOpen(false)
    showToast({ type: 'success', message: '新用户已加入待保存更改' })
  }

  const handleEdit = (values: UserBatchSaveRequest) => {
    if (!values.id) return
    if (draftIds.has(values.id)) {
      setCreateDrafts((drafts) => drafts.map((draft) => (draft.id === values.id ? { ...draft, ...values } : draft)))
    } else {
      setChanges((previous) => ({
        ...previous,
        modifyData: [
          ...previous.modifyData.filter((item) => item.id !== values.id),
          values
        ]
      }))
    }
    setEditTarget(null)
    showToast({ type: 'success', message: '用户修改已加入待保存更改' })
  }

  const handleRemove = () => {
    if (!removeTarget) return
    if (draftIds.has(removeTarget.id)) {
      setCreateDrafts((drafts) => drafts.filter((draft) => draft.id !== removeTarget.id))
    } else {
      setChanges((previous) => ({
        ...previous,
        modifyData: previous.modifyData.filter((item) => item.id !== removeTarget.id),
        removeData: [
          ...previous.removeData.filter((item) => item.id !== removeTarget.id),
          { id: removeTarget.id }
        ]
      }))
    }
    setRemoveTarget(null)
    showToast({ type: 'success', message: '删除操作已加入待保存更改' })
  }

  const discardChanges = () => {
    setChanges(emptyChanges())
    setCreateDrafts([])
    setDiscardOpen(false)
    void loadUsers(page)
    showToast({ type: 'success', message: '已放弃全部待保存更改' })
  }

  const saveChanges = async () => {
    if (!hasPendingChanges || saving) return
    setSaving(true)
    try {
      await batchSaveAdmin({
        createData: createDrafts.map((draft) => ({
          account: draft.account,
          password: draft.password,
          confirmPassword: draft.confirmPassword,
          username: draft.username,
          avatar: draft.avatar,
          profile: draft.profile
        })),
        modifyData: changes.modifyData,
        removeData: changes.removeData
      })
      const remainingTotal = Math.max(0, total - changes.removeData.length)
      const targetPage = Math.min(page, Math.max(1, Math.ceil(remainingTotal / PAGE_SIZE)))
      setChanges(emptyChanges())
      setCreateDrafts([])
      showToast({ type: 'success', message: '全部更改已保存' })
      if (targetPage === page) {
        await loadUsers(targetPage)
      } else {
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
        <Link to="/" className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand/30 hover:bg-brand-dark">
          返回主页
        </Link>
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
        <header className="flex shrink-0 flex-col gap-3 border-b border-line/70 bg-white/80 px-6 py-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h1 className="text-lg font-semibold text-ink">用户管理</h1>
            <p className="mt-0.5 text-xs text-ink-muted">暂存新增、修改和删除操作，确认后一次性保存</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasPendingChanges && (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                待保存：新增 {createDrafts.length} · 修改 {changes.modifyData.length} · 删除 {changes.removeData.length}
              </span>
            )}
            {hasPendingChanges && (
              <button type="button" onClick={() => setDiscardOpen(true)} disabled={saving} className="h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60">
                放弃全部更改
              </button>
            )}
            <button type="button" onClick={saveChanges} disabled={!hasPendingChanges || saving} className="h-10 cursor-pointer rounded-full bg-brand px-4 text-sm font-medium text-white shadow-sm shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? '保存中…' : '保存全部更改'}
            </button>
            <button type="button" onClick={() => setCreateOpen(true)} disabled={saving} className="h-10 cursor-pointer rounded-full border border-brand bg-white px-4 text-sm font-medium text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60">
              新增用户
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto p-6 lg:p-8">
          {loadError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
              <button type="button" onClick={refresh} className="ml-3 cursor-pointer font-medium underline">重试</button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-mist/70 text-xs font-medium text-ink-muted">
                    <tr>
                      <th className="px-5 py-3.5">账号</th>
                      <th className="px-5 py-3.5">用户信息</th>
                      <th className="px-5 py-3.5">角色 / 状态</th>
                      <th className="px-5 py-3.5">创建时间</th>
                      <th className="px-5 py-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {tableLoading ? (
                      <tr><td colSpan={5} className="px-5 py-16 text-center text-ink-muted">正在加载用户…</td></tr>
                    ) : displayedUsers.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-16 text-center text-ink-muted">暂无用户</td></tr>
                    ) : displayedUsers.map((user) => {
                      const isDraft = draftIds.has(user.id)
                      const isModified = changes.modifyData.some((item) => item.id === user.id)
                      return (
                        <tr key={user.id} className={isDraft ? 'bg-amber-50/45' : 'hover:bg-mist/35'}>
                          <td className="px-5 py-4 font-medium text-ink">{user.account}</td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-ink">{user.username || '-'}</div>
                            <div className="mt-0.5 max-w-xs truncate text-xs text-ink-muted">{user.profile || '暂无简介'}</div>
                          </td>
                          <td className="px-5 py-4">
                            {isDraft ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">待新增</span> : isModified ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">待修改</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{user.role === 'admin' ? '管理员' : '普通用户'}</span>}
                          </td>
                          <td className="px-5 py-4 text-ink-muted">{isDraft ? '-' : formatDateTime(user.createTime)}</td>
                          <td className="px-5 py-4 text-right">
                            <button type="button" onClick={() => setEditTarget(user)} disabled={saving} className="mr-3 cursor-pointer text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-60">编辑</button>
                            <button type="button" onClick={() => setRemoveTarget(user)} disabled={saving} className="cursor-pointer text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60">删除</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-line/70 px-5 py-3 text-sm text-ink-muted">
                <span>共 {total} 位服务端用户（待新增不计入总数）</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1 || saving} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">上一页</button>
                  <span>{page} / {totalPages}</span>
                  <button type="button" onClick={() => changePage(page + 1)} disabled={page >= totalPages || saving} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">下一页</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </motion.main>

      {createOpen && <UserCreateModal serverError="" submitting={saving} onSubmit={handleCreate} onClose={() => setCreateOpen(false)} />}
      {editTarget && <UserEditModal user={editTarget} serverError="" submitting={saving} onSubmit={handleEdit} onClose={() => setEditTarget(null)} />}
      {removeTarget && <ConfirmDialog title={draftIds.has(removeTarget.id) ? '移除新增草稿' : '删除用户'} message={draftIds.has(removeTarget.id) ? `确定移除「${removeTarget.account}」的待新增草稿吗？` : `确定将「${removeTarget.account}」加入待删除更改吗？`} confirmText={draftIds.has(removeTarget.id) ? '移除草稿' : '加入待删除'} loading={saving} onConfirm={handleRemove} onCancel={() => setRemoveTarget(null)} />}
      {discardOpen && <ConfirmDialog title="放弃全部更改" message="所有未保存的新增、修改和删除操作都会丢失，是否继续？" confirmText="放弃更改" loading={saving} onConfirm={discardChanges} onCancel={() => setDiscardOpen(false)} />}

      {toast && (
        <div role="status" className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </AdminLayout>
  )
}
