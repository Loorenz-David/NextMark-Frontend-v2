import { buildRouteGroupPlanTypeDefaults } from '@/features/plan/routeGroup/domain/planTypeDefaults/routeGroupDefaults.generator'
import type { PlanTypeDefaultsGenerator } from './planTypeDefaults.types'

export const resolvePlanTypeDefaults: PlanTypeDefaultsGenerator = buildRouteGroupPlanTypeDefaults
