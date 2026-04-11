import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { selectRouteFlow } from './selectRoute.flow'

type SelectRouteFromSideMenuFlowDependencies = {
  routeClientId: string
  workspaceScopeKey: DriverWorkspaceScopeKey
  shell: {
    openBottomSheet: (page: 'route-workspace', params: undefined) => void
    closeSideMenu: () => void
  }
}

export function selectRouteFromSideMenuFlow({
  routeClientId,
  workspaceScopeKey,
  shell,
}: SelectRouteFromSideMenuFlowDependencies) {
  selectRouteFlow({
    workspaceScopeKey,
    routeClientId,
  })
  shell.openBottomSheet('route-workspace', undefined)
  shell.closeSideMenu()
}
