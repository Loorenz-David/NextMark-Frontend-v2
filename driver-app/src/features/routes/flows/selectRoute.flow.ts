import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { persistSelectedRouteAction } from '../actions/persistSelectedRoute.action'
import { selectRouteAction } from '../actions/selectRoute.action'

type SelectRouteFlowDependencies = {
  routeClientId: string
  workspaceScopeKey: DriverWorkspaceScopeKey
}

export function selectRouteFlow({
  routeClientId,
  workspaceScopeKey,
}: SelectRouteFlowDependencies) {
  selectRouteAction(routeClientId)
  persistSelectedRouteAction({
    workspaceScopeKey,
    routeClientId,
  })
}
