import { BoldArrowIcon, CloseIcon } from '@/assets/icons'

type OrderCasePageHeaderProps = {
  title: string
  subtitle?: string | null
  onClose?: () => void
  onBack?: () => void
}

export function OrderCasePageHeader({
  title,
  subtitle,
  onClose,
  onBack,
}: OrderCasePageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white"
              onClick={onBack}
              type="button"
            >
              <BoldArrowIcon aria-hidden="true" className="h-4 w-4 rotate-180" />
            </button>
          ) : null}
          <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        </div>
        {subtitle ? <p className="mt-2 text-sm text-white/60">{subtitle}</p> : null}
      </div>

      {onClose ? (
        <button
          aria-label="Close"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}
    </header>
  )
}
