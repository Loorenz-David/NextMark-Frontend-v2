import { BoldArrowIcon } from '@/assets/icons'
import { resolveOrderOperationBadgeDirections } from '@/features/order/domain/orderOperationBadgeDirections'

type OrderOperationTypeBadgesProps = {
  operationType: string | null | undefined
}

const DirectionArrow = ({ direction }: { direction: 'up' | 'down' }) => {
  const rotationClass = direction === 'up' ? '-rotate-90' : 'rotate-90'

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.10)]  ">
      <BoldArrowIcon
        aria-hidden
        className={`h-2.5 w-2.5 ${rotationClass} text-[rgb(var(--color-light-blue-r))]`}
      />
    </span>
  )
}

export const OrderOperationTypeBadges = ({ operationType }: OrderOperationTypeBadgesProps) => {
  const directions = resolveOrderOperationBadgeDirections(operationType)
  if (!directions.length) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full  px-1 py-0.5 backdrop-blur-md">
      {directions.map((direction) => (
        <DirectionArrow key={direction} direction={direction} />
      ))}
    </span>
  )
}
