import { useEffect, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface ModalProps {
  /** 弹窗标题 */
  title: string
  /** 关闭弹窗回调（点击遮罩、关闭按钮或按 Esc 触发） */
  onClose: () => void
  children: ReactNode
}

/**
 * 通用弹窗外壳：居中卡片 + 半透明遮罩，支持 Esc 与遮罩点击关闭。
 */
export default function Modal({ title, onClose, children }: ModalProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl shadow-brand/10 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭弹窗"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-mist hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
