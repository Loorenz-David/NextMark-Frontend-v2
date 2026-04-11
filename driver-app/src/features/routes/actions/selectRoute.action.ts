import { setSelectedRoute } from '../stores'

export function selectRouteAction(routeClientId: string) {
  setSelectedRoute(routeClientId)
}
