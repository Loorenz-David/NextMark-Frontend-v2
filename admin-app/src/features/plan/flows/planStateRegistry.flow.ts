import { useMemo } from 'react'

import { useRoutePlanState } from '@/features/plan/store/routePlanState.store'
import { createPlanStateRegistry } from '@/features/plan/domain/createPlanStateRegistry'

export const usePlanStateRegistryFlow = () => {
  const states = useRoutePlanState()

  return useMemo(() => createPlanStateRegistry(states), [states])
}
