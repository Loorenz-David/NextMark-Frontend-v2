import { useShallow } from 'zustand/react/shallow'

import {
  selectAllRoutePlanStates,
  selectRoutePlanStateByClientId,
  selectRoutePlanStateByServerId,
  useRoutePlanStateStore,
} from '@/features/plan/store/routePlanState.store'

export const useRoutePlanStates = () =>
  useRoutePlanStateStore(useShallow(selectAllRoutePlanStates))

export const useRoutePlanStateByClientId = (clientId: string | null | undefined) =>
  useRoutePlanStateStore(selectRoutePlanStateByClientId(clientId))

export const useRoutePlanStateByServerId = (id: number | null | undefined) =>
  useRoutePlanStateStore(selectRoutePlanStateByServerId(id))
