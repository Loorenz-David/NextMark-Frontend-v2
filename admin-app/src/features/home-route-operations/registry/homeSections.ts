import { RouteGroupsPage } from '@/features/plan/routeGroup/pages/RouteGroups.page'
import { pageRegistry as orderPageRegistry } from '@/features/order/registry/orderSection.registry'
import { pageRegistry as orderCasePageRegistry } from '@/features/orderCase/registry/pageRegistry'
import { pageRegistry as costumerPageRegistry } from '@/features/costumer/registry/costumerSection.registry'
import { RoutePlanPage } from '@/features/plan/pages/Plan.page'

export const homeSectionRegistry = {
  ...orderPageRegistry,
  ...orderCasePageRegistry,
  ...costumerPageRegistry,
  RoutePlanPage,
  RouteGroupsPage,
}
