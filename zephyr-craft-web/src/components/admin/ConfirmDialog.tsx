import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * 危险操作确认对话框，确认按钮使用危险色并与取消按钮分离。
 */
export default function ConfirmDialog({
  title,
  message,
  confirmText = '确认',
  loading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={loading ? () => {} : onCancel}>
      <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors duration-200 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          取消
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
          {loading ? '处理中…' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
