import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { loadActiveRoutesQuery } from '../actions/loadActiveRoutes.query'
import { hydrateRoutesSelectionFlow } from './hydrateRoutesSelection.flow'
import { clearRoutes, setRoutes } from '../stores'

type InitializeActiveRoutesFlowDependencies = {
  workspaceScopeKey: DriverWorkspaceScopeKey
}

const inFlightInitializations = new Map<DriverWorkspaceScopeKey, Promise<Awaited<ReturnType<typeof runInitializeActiveRoutesFlow>>>>()

async function runInitializeActiveRoutesFlow({
  workspaceScopeKey,
}: InitializeActiveRoutesFlowDependencies) {
  const payload = await loadActiveRoutesQuery()

  clearRoutes()
  setRoutes(payload.routes)
  hydrateRoutesSelectionFlow({ workspaceScopeKey })

  return payload
}

export async function initializeActiveRoutesFlow({
  workspaceScopeKey,
}: InitializeActiveRoutesFlowDependencies) {
  const existingInitialization = inFlightInitializations.get(workspaceScopeKey)
  if (existingInitialization) {
    return existingInitialization
  }

  const initialization = runInitializeActiveRoutesFlow({
    workspaceScopeKey,
  }).finally(() => {
    inFlightInitializations.delete(workspaceScopeKey)
  })

  inFlightInitializations.set(workspaceScopeKey, initialization)
  return initialization
}
