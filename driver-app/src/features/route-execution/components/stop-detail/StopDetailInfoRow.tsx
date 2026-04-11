import { BoldArrowIcon, ItemIcon, MessageIcon, PhoneIcon, TimeIcon } from '@/assets/icons'
import type { StopDetailInfoRowDisplay } from '../../domain/stopDetailDisplay.types'


type StopDetailInfoRowProps = {
  row: StopDetailInfoRowDisplay
}

function LeadingIcon({ id }: { id: StopDetailInfoRowDisplay['id'] }) {
  const className = 'h-4 w-4 text-white/75'

  if (id === 'service-time') {
    return <TimeIcon aria-hidden="true" className={className} />
  }

  if (id === 'order-phone') {
    return <PhoneIcon aria-hidden="true" className={className} />
  }

  if (id === 'cases') {
    return <MessageIcon aria-hidden="true" className={className} />
  }

  if (id === 'customer') {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path
          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
        <path
          d="M4 21C4.9 17.9 7.9 16 12 16C16.1 16 19.1 17.9 20 21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    )
  }

  return <ItemIcon aria-hidden="true" className={className} />
}

export function StopDetailInfoRow({ row }: StopDetailInfoRowProps) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-4 text-left"
      onClick={row.onPress}
      type="button"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/6">
        <LeadingIcon id={row.id} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/60">{row.label}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{row.value}</p>
      </div>

      <BoldArrowIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-white" />
    </button>
  )
}
