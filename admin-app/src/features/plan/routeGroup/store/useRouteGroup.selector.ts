import { useShallow } from 'zustand/react/shallow'

import {
  selectAllRouteGroups,
  selectRouteGroupByClientId,
  selectRouteGroupsByPlanId,
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'

export const useRouteGroups = () =>
  useRouteGroupStore(useShallow(selectAllRouteGroups))

export const useRouteGroupByClientId = (clientId: string | null | undefined) =>
  useRouteGroupStore(selectRouteGroupByClientId(clientId))

export const useRouteGroupByServerId = (id: number | null | undefined) =>
  useRouteGroupStore(selectRouteGroupByServerId(id))

export const useRouteGroupsByPlanId = (planId: number | null | undefined) =>
  useRouteGroupStore(useShallow(selectRouteGroupsByPlanId(planId)))
