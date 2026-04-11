import { useMemo } from 'react'
import { formatRouteDateRange } from '../domain'
import { useRoutesListContext } from '../providers'

export function useRoutesListController() {
  const {
    routes,
    selectedRouteClientId,
    status,
    error,
    refreshRoutes,
    onSelectRoute,
  } = useRoutesListContext()

  const routeCards = useMemo(() => (
    routes.map((route) => ({
      routeClientId: route.client_id,
      label: route.delivery_plan?.label ?? route.label ?? 'Untitled route',
      isSelected: route.client_id === selectedRouteClientId,
      dateRangeLabel: formatRouteDateRange({
        startDate: route.delivery_plan?.start_date ?? null,
        endDate: route.delivery_plan?.end_date ?? null,
      }),
    }))
  ), [routes, selectedRouteClientId])

  return useMemo(() => ({
    status,
    error,
    routeCards,
    refreshRoutes,
    onSelectRoute,
  }), [error, onSelectRoute, refreshRoutes, routeCards, status])
}
