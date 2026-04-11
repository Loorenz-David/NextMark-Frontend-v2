import type { DeliveryPlanState, PlanStates } from '@/features/plan/types/planState'

export const createPlanStateRegistry = (states: DeliveryPlanState[]) => {
  const byId = new Map<number, DeliveryPlanState>()
  const byName = new Map<PlanStates, DeliveryPlanState>()

  states.forEach((state) => {
    if (typeof state.id === 'number') {
      byId.set(state.id, state)
    }
    byName.set(state.name, state)
  })

  const getById = (id: number | null) => (id ? byId.get(id) ?? null : null)
  const getByName = (name: PlanStates) => byName.get(name) ?? null
  const getStateIdByName = (name: PlanStates) => {
    const state = getByName(name)
    return typeof state?.id === 'number' ? state.id : null
  }

  return {
    getById,
    getByName,
    getStateIdByName,
  }
}
