import { useShallow } from 'zustand/react/shallow'

import {
  selectAllRouteSolutions,
  selectRouteSolutionByClientId,
  selectRouteSolutionByServerId,
  selectRouteSolutionsByRouteGroupId,
  selectSelectedRouteSolutionByRouteGroupId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'

export const useRouteSolutions = () =>
  useRouteSolutionStore(useShallow(selectAllRouteSolutions))

export const useRouteSolutionByClientId = (clientId: string | null | undefined) =>
  useRouteSolutionStore(selectRouteSolutionByClientId(clientId))

export const useRouteSolutionByServerId = (id: number | null | undefined) =>
  useRouteSolutionStore(selectRouteSolutionByServerId(id))

export const useRouteSolutionsByRouteGroupId = (
  routeGroupId: number | null | undefined,
) =>
  useRouteSolutionStore(useShallow(selectRouteSolutionsByRouteGroupId(routeGroupId)))

export const useSelectedRouteSolutionByRouteGroupId = (
  routeGroupId: number | null | undefined,
) =>
  useRouteSolutionStore(selectSelectedRouteSolutionByRouteGroupId(routeGroupId))


