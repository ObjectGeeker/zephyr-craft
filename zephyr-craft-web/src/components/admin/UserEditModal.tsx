import { useState, type FormEvent } from 'react'
import type { UserBatchSaveRequest, UserVO } from '../../api/user'
import Modal from './Modal'

interface UserEditModalProps {
  /** 待编辑的用户 */
  user: UserVO
  /** 服务端错误，由父组件传入展示 */
  serverError: string
  submitting: boolean
  onSubmit: (values: UserBatchSaveRequest) => void
  onClose: () => void
}

/**
 * 管理员编辑用户资料弹窗：仅可修改用户名、头像地址、个人简介。
 */
export default function UserEditModal({
  user,
  serverError,
  submitting,
  onSubmit,
  onClose
}: UserEditModalProps) {
  const [username, setUsername] = useState(user.username || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [profile, setProfile] = useState(user.profile || '')
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; avatar?: string; profile?: string }>({})

  const validateField = (name: 'username' | 'avatar' | 'profile'): string | undefined => {
    const value = name === 'username' ? username : name === 'avatar' ? avatar : profile
    const limit = name === 'username' ? 64 : 512
    if (value.length > limit) return `长度不能超过${limit}个字符`
    return undefined
  }

  const handleBlur = (name: 'username' | 'avatar' | 'profile') => {
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name) }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = {
      username: validateField('username'),
      avatar: validateField('avatar'),
      profile: validateField('profile')
    }
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit({
      id: user.id,
      username: username.trim() || undefined,
      avatar: avatar.trim() || undefined,
      profile: profile.trim() || undefined
    })
  }

  return (
    <Modal title={`编辑用户 · ${user.account}`} onClose={submitting ? () => {} : onClose}>
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
          <label htmlFor="edit-username" className="mb-1.5 block text-sm font-medium text-ink">
            用户名
          </label>
          <input
            id="edit-username"
            type="text"
            value={username}
            maxLength={64}
            onChange={(event) => setUsername(event.target.value)}
            onBlur={() => handleBlur('username')}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? 'edit-username-error' : undefined}
            placeholder="请输入用户名"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.username ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.username && (
            <p id="edit-username-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="edit-avatar" className="mb-1.5 block text-sm font-medium text-ink">
            头像地址
          </label>
          <input
            id="edit-avatar"
            type="url"
            value={avatar}
            maxLength={512}
            onChange={(event) => setAvatar(event.target.value)}
            onBlur={() => handleBlur('avatar')}
            aria-invalid={Boolean(fieldErrors.avatar)}
            aria-describedby={fieldErrors.avatar ? 'edit-avatar-error' : undefined}
            placeholder="请输入头像图片 URL"
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.avatar ? 'border-red-300' : 'border-line'
            }`}
          />
          {fieldErrors.avatar && (
            <p id="edit-avatar-error" className="mt-1.5 text-xs text-red-600">
              {fieldErrors.avatar}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="edit-profile" className="mb-1.5 block text-sm font-medium text-ink">
            个人简介
          </label>
          <textarea
            id="edit-profile"
            value={profile}
            maxLength={512}
            rows={3}
            onChange={(event) => setProfile(event.target.value)}
            onBlur={() => handleBlur('profile')}
            aria-invalid={Boolean(fieldErrors.profile)}
            aria-describedby={fieldErrors.profile ? 'edit-profile-error' : undefined}
            placeholder="请输入个人简介"
            className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
              fieldErrors.profile ? 'border-red-300' : 'border-line'
            }`}
          />
          <div className="mt-1 flex items-center justify-between">
            {fieldErrors.profile ? (
              <p id="edit-profile-error" className="text-xs text-red-600">
                {fieldErrors.profile}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-ink-muted/70 tabular-nums">{profile.length}/512</span>
          </div>
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
