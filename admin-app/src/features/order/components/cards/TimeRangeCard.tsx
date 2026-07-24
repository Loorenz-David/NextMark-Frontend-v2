import { TimeIcon } from '@/assets/icons'

type Props = {
  timeContainerClass?: string
  iconClass?: string
  textClass?: string
  from: string
  to: string
}

export const TimeRangeCard = ({
  timeContainerClass,
  iconClass,
  textClass,
  from,
  to,
}: Props) => {
  return (
    <div className={`flex w-full gap-2 ${timeContainerClass ?? defaultTimeContainerClass}`}>
      <TimeIcon className={iconClass ?? defaultIconClass} />
      <span className={textClass ?? defaultTextClass}>
        {from} - {to}
      </span>
    </div>
  )
}

const defaultIconClass = 'max-h-4 max-w-4 text-[var(--color-green-turquess)]'
const defaultTimeContainerClass =
  'items-center rounded-2xl border border-[rgba(var(--accent-r),0.24)] bg-[linear-gradient(135deg,rgba(var(--accent-r),0.18),rgba(var(--accent-r),0.09))] px-3 py-2.5 shadow-[0_6px_14px_color-mix(in_srgb,var(--color-green-turquess)_6%,transparent)]'
const defaultTextClass = 'text-sm font-medium text-[var(--accent-ink)]'
