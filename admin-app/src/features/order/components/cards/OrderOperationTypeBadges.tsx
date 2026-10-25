import { BoldArrowIcon } from '@/assets/icons'
import { resolveOrderOperationBadgeDirections } from '@/features/order/domain/orderOperationBadgeDirections'

type OrderOperationTypeBadgesProps = {
  operationType: string | null | undefined
  size?: 'sm' | 'md'
}

const DirectionArrow = ({ direction, size }: { direction: 'up' | 'down'; size: 'sm' | 'md' }) => {
  const rotationClass = direction === 'up' ? '-rotate-90' : 'rotate-90'

  return (
    <span className={`inline-flex items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.10)] ${size === 'md' ? 'h-7 w-7' : 'h-5 w-5'}`}>
      <BoldArrowIcon
        aria-hidden
        className={`${size === 'md' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'} ${rotationClass} text-[rgb(var(--color-light-blue-r))]`}
      />
    </span>
  )
}

export const OrderOperationTypeBadges = ({ operationType, size = 'sm' }: OrderOperationTypeBadgesProps) => {
  const directions = resolveOrderOperationBadgeDirections(operationType)
  if (!directions.length) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full  px-1 py-0.5 backdrop-blur-md">
      {directions.map((direction) => (
        <DirectionArrow key={direction} direction={direction} size={size} />
      ))}
    </span>
  )
}
