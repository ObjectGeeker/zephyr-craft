import { motion, useReducedMotion } from 'motion/react'

interface CaseItem {
  title: string
  description: string
  gradient: string
}

const CASES: CaseItem[] = [
  {
    title: '简约作品集',
    description: '设计师个人作品展示站点',
    gradient: 'from-blue-500 to-blue-700'
  },
  {
    title: '咖啡店官网',
    description: '品牌故事与门店导览页面',
    gradient: 'from-sky-400 to-blue-600'
  },
  {
    title: 'SaaS 落地页',
    description: '产品功能介绍与转化页面',
    gradient: 'from-indigo-500 to-blue-800'
  },
  {
    title: '活动报名页',
    description: '线下活动宣传与表单收集',
    gradient: 'from-cyan-400 to-blue-600'
  }
]

function CardThumb() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col gap-1.5 rounded-lg bg-white/20 p-2.5 backdrop-blur-[1px]"
    >
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
        <span className="ml-auto h-1.5 w-8 rounded-full bg-white/60" />
      </div>
      <div className="mt-1 h-2.5 w-3/4 rounded bg-white/80" />
      <div className="h-1.5 w-1/2 rounded bg-white/50" />
      <div className="mt-auto flex gap-1.5">
        <div className="h-7 flex-1 rounded bg-white/40" />
        <div className="h-7 flex-1 rounded bg-white/40" />
        <div className="h-7 flex-1 rounded bg-white/40" />
      </div>
    </div>
  )
}

export default function CaseShowcase() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="shrink-0 px-6 pb-5 lg:px-12" aria-label="灵感案例">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink sm:text-base">灵感案例</h2>
          <a
            href="#"
            className="flex cursor-pointer items-center gap-1 text-xs text-ink-muted transition-colors duration-200 hover:text-brand sm:text-sm"
          >
            查看更多
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CASES.map((item, index) => (
            <motion.li
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.15 + index * 0.06, ease: 'easeOut' }}
              className="min-w-0"
            >
              <a
                href="#"
                aria-label={`查看案例：${item.title}`}
                className="group block cursor-pointer overflow-hidden rounded-xl border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <div
                  className={`aspect-[16/8] w-full bg-gradient-to-br p-3 transition-transform duration-200 ${item.gradient}`}
                >
                  <CardThumb />
                </div>
                <div className="px-3.5 py-2.5">
                  <p className="truncate text-sm font-medium text-ink group-hover:text-brand">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{item.description}</p>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
