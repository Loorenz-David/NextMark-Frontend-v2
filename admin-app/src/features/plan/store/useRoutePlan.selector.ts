import {
  useRoutePlanStore,
  selectAllRoutePlans,
  selectRoutePlanByClientId,
  selectRoutePlanByServerId,
  selectVisibleRoutePlans,
  useRoutePlanStateById as useRoutePlanStateStoreById,
} from '@/features/plan/store/routePlan.slice'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'
import { reactivePlanVisibility } from '@/features/plan/domain/planReactiveVisibility'
import { selectRoutePlanListQuery, useRoutePlanListStore } from './routePlanList.store'

export const useRoutePlans = () => useRoutePlanStore(useShallow(selectAllRoutePlans))
export const useVisibleRoutePlans = () => {
  const routePlans = useRoutePlanStore(useShallow(selectVisibleRoutePlans))
  const query = useRoutePlanListStore(selectRoutePlanListQuery)

  return useMemo(
    () => routePlans.filter((routePlan) => reactivePlanVisibility(routePlan, query)),
    [routePlans, query],
  )
}

export const useRoutePlanByClientId = (clientId: string | null | undefined) =>
  useRoutePlanStore(selectRoutePlanByClientId(clientId))

export const useRoutePlanByServerId = (id: number | null | undefined) =>
  useRoutePlanStore(selectRoutePlanByServerId(id))

export const useRoutePlanStateById = (stateId: number | null | undefined) =>
  useRoutePlanStateStoreById(stateId)
