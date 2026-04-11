
export type LoadingScenarios =
  | 'isOptimizing'

// RouteGroup is the canonical name — LocalDeliveryPlan aliases are kept during migration
export type RouteGroup = {
  id?:number
  client_id: string
  actual_start_time?: string | null
  actual_end_time?: string | null
  is_optimized?: boolean
  driver_id?: number | null
  route_plan_id?: number | null
  updated_at?: string | null
  route_solutions_ids?: number[]
  is_loading?: LoadingScenarios
  optimization_started_at?: number | null
}

export type RouteGroupMap = {
  byClientId: Record<string, RouteGroup>
  allIds: string[]
}

export type RouteGroupInput = Omit<RouteGroup, 'id'>

// Migration aliases — remove after Phase 3 promotion
export type LocalDeliveryPlan = RouteGroup
export type LocalDeliveryPlanMap = RouteGroupMap
export type LocalDeliveryPlanInput = RouteGroupInput
