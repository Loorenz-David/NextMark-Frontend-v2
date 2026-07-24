export interface InputWarningState {
  message?: string
  isVisible: boolean
}

export function InputWarning({ message, isVisible }: InputWarningState) {
  if (!isVisible || !message) {
    return null
  }

  return (
    <span className="flex w-full items-center rounded-2xl border border-[var(--danger-notice-border)]/32 bg-[linear-gradient(135deg,rgba(var(--danger-highlight-r),0.14),rgba(var(--danger-highlight-r),0.05))] px-3 py-2 text-[0.8rem] font-medium text-[var(--danger-notice-ink)] shadow-[var(--shadow-panel-notice)] backdrop-blur-md">
      {message}
    </span>
  )
}
