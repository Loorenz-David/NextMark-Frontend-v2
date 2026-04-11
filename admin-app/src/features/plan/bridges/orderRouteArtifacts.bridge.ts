import { normalizeOrderStopResponse } from '@/features/order/domain/orderStopResponse'
import { normalizeByClientIdArray } from '@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper'
import { upsertRouteSolution } from '@/features/plan/routeGroup/store/routeSolution.store'
import { upsertRouteSolutionStops } from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionMap } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

type RouteArtifactsBundle = {
  order_stops?: RouteSolutionStop[]
  route_solution?: RouteSolution[] | RouteSolutionMap | RouteSolution | null
}

export const applyOrderRouteArtifacts = (bundle?: RouteArtifactsBundle | null): void => {
  if (!bundle) return

  const normalizedStops = normalizeOrderStopResponse(bundle.order_stops)
  if (normalizedStops) {
    upsertRouteSolutionStops(normalizedStops)
  }

  const routeSolutions = normalizeByClientIdArray<RouteSolution>(
    bundle.route_solution ?? undefined,
  )
  routeSolutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })
}
