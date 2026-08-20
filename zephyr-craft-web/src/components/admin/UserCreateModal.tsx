import { useState, type FormEvent } from 'react'
import Modal from './Modal'

export interface UserCreateValues {
  account: string
  password: string
  confirmPassword: string
}

interface FieldErrors {
  account?: string
  password?: string
  confirmPassword?: string
}

interface UserCreateModalProps {
  /** 服务端错误（如"账号已存在"），由父组件传入展示 */
  serverError: string
  submitting: boolean
  onSubmit: (values: UserCreateValues) => void
  onClose: () => void
}

const MAX_LENGTH = 64

/**
 * 管理员创建用户弹窗：账号 + 密码 + 确认密码。
 */
export default function UserCreateModal({
  serverError,
  submitting,
  onSubmit,
  onClose
}: UserCreateModalProps) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const validateField = (name: keyof FieldErrors): string | undefined => {
    const values = { account: account.trim(), password, confirmPassword }
    const value = values[name]
    if (!value) {
      if (name === 'account') return '账号不能为空'
      if (name === 'password') return '密码不能为空'
      return '确认密码不能为空'
    }
    if (value.length > MAX_LENGTH) return '长度不能超过64个字符'
    if (name === 'confirmPassword' && value !== password) return '两次输入的密码不一致'
    return undefined
  }

  const handleBlur = (name: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name) }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const names: (keyof FieldErrors)[] = ['account', 'password', 'confirmPassword']
    const nextErrors: FieldErrors = {}
    for (const name of names) {
      nextErrors[name] = validateField(name)
    }
    setFieldErrors(nextErrors)
    if (names.some((name) => nextErrors[name])) return
    onSubmit({ account: account.trim(), password, confirmPassword })
  }

  return (
    <Modal title="新增用户" onClose={submitting ? () => {} : onClose}>
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
          <label htmlFor="create-account" className="mb-1.5 block text-sm font-medium text-ink">
            账号 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="create-account"
            type="text"
            value={account}
            autoComplete="off"
            maxLength={MAX_LENGTH}
            onChange={(event) => setAccount(event.target.value)}
            onBlur={() => handleBlur('account')}
            aria-invalid={Boolean(fieldErrors.account)}
            aria-describedby={fieldErrors.account ? 'create-account-error' : undefined}
            placeholder="请输入账号"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.account ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.account && (
            <p id="create-account-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.account}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="create-password" className="mb-1.5 block text-sm font-medium text-ink">
            密码 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="create-password"
            type="password"
            value={password}
            autoComplete="new-password"
            maxLength={MAX_LENGTH}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => handleBlur('password')}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'create-password-error' : undefined}
            placeholder="请输入密码"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.password ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.password && (
            <p id="create-password-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="create-confirm" className="mb-1.5 block text-sm font-medium text-ink">
            确认密码 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="create-confirm"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            maxLength={MAX_LENGTH}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'create-confirm-error' : undefined}
            placeholder="请再次输入密码"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.confirmPassword ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.confirmPassword && (
            <p id="create-confirm-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
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
            {submitting ? '创建中…' : '创建用户'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
