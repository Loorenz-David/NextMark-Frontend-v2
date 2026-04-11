import type { OrderCaseState } from '../domain'
import { SegmentedRailSelector } from '@/shared/components'

type OrderCaseStateSelectorProps = {
  value: OrderCaseState
  onSelect: (state: OrderCaseState) => void
  isUpdating?: boolean
}

const ORDER_CASE_STATES: OrderCaseState[] = ['Open', 'Resolving', 'Resolved']

const stateActiveClasses: Record<OrderCaseState, string> = {
  Open: 'bg-cyan-300/20 text-cyan-100 border-cyan-200/30',
  Resolving: 'bg-amber-300/20 text-amber-100 border-amber-200/30',
  Resolved: 'bg-emerald-300/20 text-emerald-100 border-emerald-200/30',
}

export function OrderCaseStateSelector({
  value,
  onSelect,
  isUpdating = false,
}: OrderCaseStateSelectorProps) {
  return (
    <SegmentedRailSelector
      isLoading={isUpdating}
      onChange={onSelect}
      options={ORDER_CASE_STATES.map((state) => ({
        id: state,
        label: state,
        activeClassName: stateActiveClasses[state],
      }))}
      value={value}
    />
  )
}
