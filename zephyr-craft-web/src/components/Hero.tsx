import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { createApp } from '../api/app'
import { BusinessError } from '../api/request'
import { useUser } from '../store/useUser'

const QUICK_PROMPTS = [
  { label: '企业官网', prompt: '帮我搭建一个现代简约风格的企业官网' },
  { label: '个人博客', prompt: '帮我搭建一个清新风格的个人博客网站' },
  { label: '电商落地页', prompt: '帮我搭建一个高转化率的电商产品落地页' },
  { label: '数据看板', prompt: '帮我搭建一个可视化数据分析看板' }
]

export default function Hero() {
  const [value, setValue] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const { currentUser } = useUser()

  const handleSubmit = async () => {
    const prompt = value.trim()
    if (!prompt || creating) return
    if (!currentUser) {
      navigate('/login')
      return
    }
    setCreating(true)
    setError('')
    try {
      // 先创建应用拿到 appId，再进入生成页发起流式代码生成
      const app = await createApp({ initPrompt: prompt })
      navigate(`/generate/${app.id}`, { state: { prompt } })
    } catch (err) {
      setError(err instanceof BusinessError ? err.message : '应用创建失败，请稍后重试')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-2"
      aria-label="创建你的网站"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full max-w-3xl flex-col items-center text-center"
      >
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-3.5 py-1.5 text-xs font-medium text-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l1.9 5.7a2 2 0 0 0 1.3 1.3L21 11l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 20l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 11l5.8-2a2 2 0 0 0 1.3-1.3L12 2z" />
          </svg>
          AI 驱动 · 零代码建站
        </span>

        <h1 className="text-4xl leading-tight font-bold tracking-tight text-ink sm:text-5xl">
          一句话，搭建你的
          <span className="bg-gradient-to-r from-brand to-brand-deep bg-clip-text text-transparent">
            网站应用
          </span>
        </h1>
        <p className="mt-4 text-base text-ink-muted sm:text-lg">
          描述你的想法，AI 自动生成页面结构、样式与内容，无需编写任何代码
        </p>

        <div className="mt-8 w-full">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2 pl-5 shadow-lg shadow-brand/8 transition-shadow duration-200 focus-within:border-brand/50 focus-within:shadow-brand/15">
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSubmit()
              }}
              placeholder="描述你想搭建的网站，例如：一个极简风格的作品集网站"
              aria-label="描述你想搭建的网站"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 sm:text-base"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={creating}
              aria-label="生成网站"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand text-white transition-all duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 11.5 20 4l-4.5 16-4-6.5L4 11.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="m11.5 13.5 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setValue(item.prompt)}
                className="cursor-pointer rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-xs text-ink-muted transition-all duration-200 hover:border-brand/40 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand sm:text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
