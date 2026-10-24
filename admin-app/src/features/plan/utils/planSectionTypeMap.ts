import { RouteGroupsPage } from '@/features/plan/routeGroup/pages/RouteGroups.page'

export const routePlanSectionKey = 'RouteGroupsPage'
export const RoutePlanSectionPage: typeof RouteGroupsPage = RouteGroupsPage
export const PlanSectionTypesMap = {
  local_delivery: RouteGroupsPage,
} as const
