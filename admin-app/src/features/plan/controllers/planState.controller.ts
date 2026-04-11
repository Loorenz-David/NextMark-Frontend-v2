import { selectRoutePlanByClientId, selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'
import type { PlanStates } from '@/features/plan/types/planState'
import { usePlanStateRegistryFlow } from '@/features/plan/flows/planStateRegistry.flow'

export const usePlanStateChanges = () => {
  const planStateRegistry = usePlanStateRegistryFlow()

  const changePlanState = (planIdentity: string | number, state: PlanStates | number) => {
    const planStore = useRoutePlanStore.getState()
    const plan =
      typeof planIdentity === 'number'
        ? selectRoutePlanByServerId(planIdentity)(planStore)
        : selectRoutePlanByClientId(planIdentity)(planStore)

    if (!plan) {
      throw new Error(`No plan found with plan identity: ${planIdentity}`)
    }

    const currentPlanState = plan.state_id ?? 1
    const nextState =
      typeof state === 'number'
        ? planStateRegistry.getById(state)
        : planStateRegistry.getByName(state)

    if (!nextState?.id) {
      throw new Error(`No state found or missing server id for state: ${state}`)
    }

    planStore.patch(plan.client_id, { state_id: nextState.id })

    return [plan.client_id, currentPlanState] as const
  }

  return {
    changePlanState,
  }
}
