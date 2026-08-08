interface ConfirmDialogProps {
  isOpen: boolean
  message: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
}

export function ConfirmDialog({ isOpen, message, description, onConfirm, onCancel, confirmText = "Eliminar" }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-theme-surface p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-theme-border max-w-sm w-full">
        <h3 className="text-lg font-bold text-theme-text mb-2">{message}</h3>
        {description && <p className="text-theme-text-muted text-sm mb-6 leading-relaxed">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-theme-text-muted font-medium hover:bg-theme-surface-alt transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-900/40 text-red-400 font-medium rounded-xl hover:bg-red-600 hover:text-white transition-colors border border-red-500/30 cursor-pointer shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
