import { motion, useReducedMotion } from 'motion/react'

const NAV_LINKS = ['功能', '案例', '文档']

export default function TopNav() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-line/70 bg-white/80 px-6 backdrop-blur-sm lg:px-12"
    >
      <a href="/" className="flex cursor-pointer items-center gap-2.5" aria-label="Zephyr Craft 首页">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-sm shadow-brand/30">
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
      </a>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="主导航">
        {NAV_LINKS.map((label, index) => (
          <a
            key={label}
            href="#"
            className={`hidden cursor-pointer rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-brand focus-visible:outline-2 focus-visible:outline-brand md:block ${
              index === 1 ? 'sm:block' : ''
            }`}
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          className="ml-2 cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          开始创作
        </button>
      </nav>
    </motion.header>
  )
}
