type DeliveryWindowCalendarWarningNoticeProps = {
  message: string | null
  helperText: string
  compact?: boolean
}

export const DeliveryWindowCalendarWarningNotice = ({
  message,
  helperText,
  compact = false,
}: DeliveryWindowCalendarWarningNoticeProps) => {
  if (message) {
    return (
      <div
        className={`rounded-2xl border border-[#ff8f8f]/32 bg-[linear-gradient(135deg,rgba(var(--danger-highlight-r),0.14),rgba(var(--danger-highlight-r),0.05))] px-3 py-2 font-medium text-[#ffd1d1] shadow-[var(--shadow-panel-notice)] backdrop-blur-md ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
      >
        {message}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <p className={`text-[var(--color-muted)] ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {helperText}
      </p>
    </div>
  )
}
