import { useState, type FormEvent } from 'react'
import Modal from './admin/Modal'

interface AppRenameModalProps {
  /** 待重命名的应用 */
  app: { id: string; appName: string }
  /** 服务端错误，由父组件传入展示 */
  serverError: string
  submitting: boolean
  onSubmit: (values: { id: string; appName: string }) => void
  onClose: () => void
}

/**
 * 应用重命名弹窗：仅修改应用名称，行内校验非空与长度上限。
 */
export default function AppRenameModal({
  app,
  serverError,
  submitting,
  onSubmit,
  onClose
}: AppRenameModalProps) {
  const [appName, setAppName] = useState(app.appName || '')
  const [fieldError, setFieldError] = useState('')

  const validate = (value: string): string => {
    if (!value.trim()) return '应用名称不能为空'
    if (value.trim().length > 256) return '应用名称长度不能超过256个字符'
    return ''
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const error = validate(appName)
    setFieldError(error)
    if (error) return
    onSubmit({ id: app.id, appName: appName.trim() })
  }

  return (
    <Modal title="重命名应用" onClose={submitting ? () => {} : onClose}>
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
          <label htmlFor="rename-app-name" className="mb-1.5 block text-sm font-medium text-ink">
            应用名称
          </label>
          <input
            id="rename-app-name"
            type="text"
            value={appName}
            maxLength={256}
            autoFocus
            onChange={(event) => setAppName(event.target.value)}
            onBlur={() => setFieldError(validate(appName))}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'rename-app-name-error' : undefined}
            placeholder="请输入应用名称"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldError ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldError && (
            <p id="rename-app-name-error" className="mt-1.5 text-xs text-red-600">
              {fieldError}
            </p>
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
            {submitting ? '保存中…' : '保存'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
