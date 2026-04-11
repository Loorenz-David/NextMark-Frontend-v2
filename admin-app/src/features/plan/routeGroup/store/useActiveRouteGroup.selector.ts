import {
  clearActiveRouteGroupSelection,
  rememberRouteGroupForPlan,
  selectActiveRouteGroupId,
  selectLastOpenedRouteGroupIdByPlanId,
  setActiveRouteGroupId,
  useActiveRouteGroupStore,
} from './activeRouteGroup.store'

export const useActiveRouteGroupId = () => useActiveRouteGroupStore(selectActiveRouteGroupId)
export const useLastOpenedRouteGroupIdByPlanId = (planId: number | null | undefined) =>
  useActiveRouteGroupStore(selectLastOpenedRouteGroupIdByPlanId(planId))

export const useActiveRouteGroupActions = () => ({
  setActiveRouteGroupId,
  rememberRouteGroupForPlan,
  clearActiveRouteGroupSelection,
})
