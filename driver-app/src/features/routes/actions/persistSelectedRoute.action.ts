import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { routeSelectionService } from '@/app/services/routeSelection.service'

type PersistSelectedRouteActionDependencies = {
  workspaceScopeKey: DriverWorkspaceScopeKey
  routeClientId: string
}

export function persistSelectedRouteAction({
  workspaceScopeKey,
  routeClientId,
}: PersistSelectedRouteActionDependencies) {
  routeSelectionService.set(workspaceScopeKey, {
    routeClientId,
    selectedAt: new Date().toISOString(),
  })
}
