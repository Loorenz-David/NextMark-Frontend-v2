export interface InputWarningState {
  message?: string
  isVisible: boolean
}

export function InputWarning({ message, isVisible }: InputWarningState) {
  if (!isVisible || !message) {
    return null
  }

  return (
    <span className="flex w-full items-center rounded-[16px] border border-[#ff8f8f]/32 bg-[linear-gradient(135deg,rgba(255,120,120,0.14),rgba(255,120,120,0.05))] px-3 py-2 text-[0.8rem] font-medium text-[#ffd1d1] shadow-[0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-md">
      {message}
    </span>
  )
}
