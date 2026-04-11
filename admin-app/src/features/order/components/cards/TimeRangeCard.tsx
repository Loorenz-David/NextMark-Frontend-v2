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
  'items-center rounded-[16px] border border-[rgba(112,222,208,0.24)] bg-[linear-gradient(135deg,rgba(72,180,194,0.18),rgba(111,224,207,0.09))] px-3 py-2.5 shadow-[0_6px_14px_rgba(54,182,194,0.06)]'
const defaultTextClass = 'text-sm font-medium text-[rgb(221,255,249)]'
