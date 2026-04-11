import { create } from 'zustand'

type ActiveRouteGroupState = {
  activeRouteGroupId: number | null
  lastOpenedRouteGroupIdByPlanId: Record<number, number>
  setActiveRouteGroupId: (routeGroupId: number | null) => void
  rememberRouteGroupForPlan: (planId: number, routeGroupId: number) => void
  clearActiveRouteGroupSelection: () => void
}

export const useActiveRouteGroupStore = create<ActiveRouteGroupState>((set) => ({
  activeRouteGroupId: null,
  lastOpenedRouteGroupIdByPlanId: {},
  setActiveRouteGroupId: (routeGroupId) =>
    set((state) => {
      if (state.activeRouteGroupId === routeGroupId) return state
      return { ...state, activeRouteGroupId: routeGroupId }
    }),
  rememberRouteGroupForPlan: (planId, routeGroupId) =>
    set((state) => {
      if (state.lastOpenedRouteGroupIdByPlanId[planId] === routeGroupId) {
        return state
      }
      return {
        ...state,
        lastOpenedRouteGroupIdByPlanId: {
          ...state.lastOpenedRouteGroupIdByPlanId,
          [planId]: routeGroupId,
        },
      }
    }),
  clearActiveRouteGroupSelection: () =>
    set((state) => {
      if (state.activeRouteGroupId == null) return state
      return { ...state, activeRouteGroupId: null }
    }),
}))

export const selectActiveRouteGroupId = (state: ActiveRouteGroupState) => state.activeRouteGroupId
export const selectLastOpenedRouteGroupIdByPlanId = (planId: number | null | undefined) =>
  (state: ActiveRouteGroupState) => {
    if (planId == null) return null
    return state.lastOpenedRouteGroupIdByPlanId[planId] ?? null
  }

export const setActiveRouteGroupId = (routeGroupId: number | null) =>
  useActiveRouteGroupStore.getState().setActiveRouteGroupId(routeGroupId)

export const rememberRouteGroupForPlan = (planId: number, routeGroupId: number) =>
  useActiveRouteGroupStore.getState().rememberRouteGroupForPlan(planId, routeGroupId)

export const getLastOpenedRouteGroupIdByPlanId = (planId: number | null | undefined) =>
  selectLastOpenedRouteGroupIdByPlanId(planId)(useActiveRouteGroupStore.getState())

export const clearActiveRouteGroupSelection = () =>
  useActiveRouteGroupStore.getState().clearActiveRouteGroupSelection()
