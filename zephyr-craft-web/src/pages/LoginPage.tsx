import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BusinessError } from '../api/request'
import { login, register } from '../api/user'
import { useUser } from '../store/useUser'
import loginHero from '../assets/login-hero.png'

type Mode = 'login' | 'register'

interface FieldErrors {
  account?: string
  password?: string
  confirmPassword?: string
}

const MAX_LENGTH = 64

export default function LoginPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { fetchLoginUser } = useUser()

  const [mode, setMode] = useState<Mode>('login')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateField = (
    name: keyof FieldErrors,
    values: { account: string; password: string; confirmPassword: string }
  ): string | undefined => {
    const value = values[name].trim()
    if (!value) {
      if (name === 'account') return '账号不能为空'
      if (name === 'password') return '密码不能为空'
      return '确认密码不能为空'
    }
    if (value.length > MAX_LENGTH) return '长度不能超过64个字符'
    if (name === 'confirmPassword' && mode === 'register' && value !== values.password) {
      return '两次输入的密码不一致'
    }
    return undefined
  }

  const handleBlur = (name: keyof FieldErrors) => {
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, { account, password, confirmPassword })
    }))
  }

  const switchMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
    setFieldErrors({})
    setServerError('')
    setConfirmPassword('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const values = { account: account.trim(), password, confirmPassword }
    const names: (keyof FieldErrors)[] =
      mode === 'login' ? ['account', 'password'] : ['account', 'password', 'confirmPassword']
    const nextErrors: FieldErrors = {}
    for (const name of names) {
      nextErrors[name] = validateField(name, values)
    }
    setFieldErrors(nextErrors)
    if (names.some((name) => nextErrors[name])) return

    setServerError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login({ account: values.account, password })
      } else {
        await register({ account: values.account, password, confirmPassword })
      }
      await fetchLoginUser()
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(error instanceof BusinessError ? error.message : '操作失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f6f7fa]">
      {/* 左侧品牌区：背景图 + 文字浮层 */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-[#eef1f9] p-12 lg:flex"
        aria-label="品牌介绍"
      >
        <img
          src={loginHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <a href="/" className="relative flex items-center gap-2.5" aria-label="返回 Zephyr Craft 首页">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-sm shadow-brand/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3.5 12.5 12 3l3 7.5L20.5 9 12 21l-2-6.5-6.5-2Z"
                fill="white"
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-xl font-semibold tracking-tight text-ink">
            Zephyr<span className="text-brand"> Craft</span>
          </span>
        </a>

        <div className="relative max-w-xl -translate-y-24">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-brand shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l1.9 5.7a2 2 0 0 0 1.3 1.3L21 11l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 20l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 11l5.8-2a2 2 0 0 0 1.3-1.3L12 2z" />
            </svg>
            AI 驱动 · 零代码建站
          </span>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-ink">
            一句话，搭建你的
            <span className="text-brand">网站应用</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            描述你的想法，AI 自动生成页面结构、样式与内容，无需编写任何代码
          </p>
        </div>

        <p className="relative text-xs text-ink-muted/70">Zephyr Craft · 让创意即刻落地</p>
      </motion.section>

      {/* 右侧表单区 */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: reduceMotion ? 0 : 0.1 }}
        className="flex flex-1 items-center justify-center px-6"
        aria-label="登录注册"
      >
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm sm:p-10">
          {/* 移动端 logo */}
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep">
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
            <span className="text-lg font-semibold tracking-tight text-ink">
              Zephyr<span className="text-brand"> Craft</span>
            </span>
          </div>

          {/* 登录/注册切换 */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-mist p-1" role="tablist" aria-label="登录或注册">
            {(
              [
                { key: 'login', label: '登录' },
                { key: 'register', label: '注册' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={mode === tab.key}
                onClick={() => switchMode(tab.key)}
                className={`cursor-pointer rounded-lg py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand ${
                  mode === tab.key ? 'bg-white text-brand shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-ink">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === 'login' ? '登录后继续你的创作' : '注册并自动登录，即刻开始创作'}
          </p>

          {serverError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
              </svg>
              {serverError}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="account" className="mb-1.5 block text-sm font-medium text-ink">
                账号 <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="account"
                name="account"
                type="text"
                value={account}
                autoComplete="username"
                maxLength={MAX_LENGTH}
                onChange={(event) => setAccount(event.target.value)}
                onBlur={() => handleBlur('account')}
                aria-invalid={Boolean(fieldErrors.account)}
                aria-describedby={fieldErrors.account ? 'account-error' : undefined}
                placeholder="请输入账号"
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
                  fieldErrors.account ? 'border-red-300' : 'border-line'
                }`}
              />
              {fieldErrors.account && (
                <p id="account-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.account}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                密码 <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  maxLength={MAX_LENGTH}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  placeholder="请输入密码"
                  className={`h-11 w-full rounded-xl border bg-white px-4 pr-12 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
                    fieldErrors.password ? 'border-red-300' : 'border-line'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M6.7 6.9C4.6 8.2 3 10 2.2 12c1.6 3.6 5.3 6.5 9.8 6.5 1.8 0 3.4-.4 4.8-1.2M9.9 4.8A12 12 0 0 1 12 4.5c4.5 0 8.2 2.9 9.8 6.5a13 13 0 0 1-2.7 3.7"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2.2 12c1.6-3.6 5.3-6.5 9.8-6.5S20.2 8.4 21.8 12c-1.6 3.6-5.3 6.5-9.8 6.5S3.8 15.6 2.2 12Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
                  确认密码 <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  autoComplete="new-password"
                  maxLength={MAX_LENGTH}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  placeholder="请再次输入密码"
                  className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-brand ${
                    fieldErrors.confirmPassword ? 'border-red-300' : 'border-line'
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-white shadow-sm shadow-brand/30 transition-all duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="animate-spin"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {submitting ? (mode === 'login' ? '登录中…' : '注册中…') : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 cursor-pointer font-medium text-brand transition-colors duration-200 hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>
      </motion.section>
    </div>
  )
}
