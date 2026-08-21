import { useState, type FormEvent } from 'react'
import { APP_PRIORITY, type AppBatchSaveRequest, type AppVO } from '../../api/app'
import Modal from './Modal'

interface AppEditModalProps {
  /** 待编辑的应用 */
  app: AppVO
  /** 服务端错误，由父组件传入展示 */
  serverError: string
  submitting: boolean
  onSubmit: (values: AppBatchSaveRequest) => void
  onClose: () => void
}

/**
 * 管理员编辑应用弹窗：可修改应用名称、封面地址与优先级（加精）。
 */
export default function AppEditModal({ app, serverError, submitting, onSubmit, onClose }: AppEditModalProps) {
  const [appName, setAppName] = useState(app.appName || '')
  const [cover, setCover] = useState(app.cover || '')
  const [priority, setPriority] = useState(app.priority ?? APP_PRIORITY.NORMAL)
  const [fieldErrors, setFieldErrors] = useState<{ appName?: string; cover?: string; priority?: string }>({})

  const isFeatured = priority === APP_PRIORITY.FEATURED

  const validateField = (name: 'appName' | 'cover' | 'priority'): string | undefined => {
    if (name === 'appName') {
      const value = appName.trim()
      if (!value) return '应用名称不能为空'
      if (value.length > 256) return '应用名称长度不能超过256个字符'
      return undefined
    }
    if (name === 'cover') {
      if (cover.length > 512) return '封面地址长度不能超过512个字符'
      return undefined
    }
    if (!Number.isInteger(priority)) return '优先级必须为整数'
    return undefined
  }

  const handleBlur = (name: 'appName' | 'cover' | 'priority') => {
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name) }))
  }

  const handleFeaturedToggle = (checked: boolean) => {
    setPriority(checked ? APP_PRIORITY.FEATURED : APP_PRIORITY.NORMAL)
    setFieldErrors((prev) => ({ ...prev, priority: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = {
      appName: validateField('appName'),
      cover: validateField('cover'),
      priority: validateField('priority')
    }
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit({
      id: app.id,
      appName: appName.trim(),
      cover: cover.trim() || undefined,
      priority
    })
  }

  return (
    <Modal title={`编辑应用 · ${app.appName}`} onClose={submitting ? () => {} : onClose}>
      {serverError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          </svg>
          {serverError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="edit-app-name" className="mb-1.5 block text-sm font-medium text-ink">
            应用名称
          </label>
          <input
            id="edit-app-name"
            type="text"
            value={appName}
            maxLength={256}
            onChange={(event) => setAppName(event.target.value)}
            onBlur={() => handleBlur('appName')}
            aria-invalid={Boolean(fieldErrors.appName)}
            aria-describedby={fieldErrors.appName ? 'edit-app-name-error' : undefined}
            placeholder="请输入应用名称"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.appName ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.appName && (
            <p id="edit-app-name-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.appName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="edit-app-cover" className="mb-1.5 block text-sm font-medium text-ink">
            封面地址
          </label>
          <input
            id="edit-app-cover"
            type="url"
            value={cover}
            maxLength={512}
            onChange={(event) => setCover(event.target.value)}
            onBlur={() => handleBlur('cover')}
            aria-invalid={Boolean(fieldErrors.cover)}
            aria-describedby={fieldErrors.cover ? 'edit-app-cover-error' : undefined}
            placeholder="请输入封面图片 URL"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.cover ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.cover && (
            <p id="edit-app-cover-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.cover}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="edit-app-priority" className="mb-1.5 block text-sm font-medium text-ink">
            优先级
          </label>
          <div className="flex items-center gap-3">
            <input
              id="edit-app-priority"
              type="number"
              value={Number.isNaN(priority) ? '' : priority}
              onChange={(event) => {
                const value = event.target.value
                setPriority(value === '' ? Number.NaN : Number(value))
              }}
              onBlur={() => handleBlur('priority')}
              aria-invalid={Boolean(fieldErrors.priority)}
              aria-describedby={fieldErrors.priority ? 'edit-app-priority-error' : undefined}
              className={`h-11 w-28 rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 focus:border-brand ${
                fieldErrors.priority ? 'border-red-300' : 'border-line'
              }`}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => handleFeaturedToggle(event.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              设为精选
            </label>
          </div>
          {fieldErrors.priority ? (
            <p id="edit-app-priority-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.priority}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-ink-muted/70">精选应用优先级为 {APP_PRIORITY.FEATURED}，普通应用为 {APP_PRIORITY.NORMAL}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors duration-200 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-all duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
            {submitting ? '保存中…' : '保存修改'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
