import { useCallback, useMemo, useState } from 'react'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

export function useStopOrderItemsController(stopClientId?: string) {
  const route = useSelectedAssignedRoute()
  const [expandedItemClientId, setExpandedItemClientId] = useState<string | null>(null)

  const stop = useMemo(
    () => route?.stops.find((candidate) => candidate.stopClientId === stopClientId) ?? null,
    [route, stopClientId],
  )

  const items = useMemo(() => stop?.orderItems ?? [], [stop?.orderItems])

  const toggleItem = useCallback((clientId: string) => {
    setExpandedItemClientId((current) => (current === clientId ? null : clientId))
  }, [])

  const subtitle = stop?.order
    ? items.length > 0
      ? `${items.length} item${items.length === 1 ? '' : 's'} on this order.`
      : 'No items on this order.'
    : 'This stop has no order items yet.'

  const resolvedExpandedItemClientId = useMemo(() => {
    if (expandedItemClientId == null) {
      return null
    }

    return items.some((item) => item.clientId === expandedItemClientId)
      ? expandedItemClientId
      : null
  }, [expandedItemClientId, items])

  return useMemo(() => ({
    stop,
    items,
    expandedItemClientId: resolvedExpandedItemClientId,
    toggleItem,
    subtitle,
  }), [items, resolvedExpandedItemClientId, stop, subtitle, toggleItem])
}
