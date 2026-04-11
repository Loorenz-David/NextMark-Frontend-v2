
export type PlanStates = 
  | 'Open'
  | 'Ready'
  | 'Processing'
  | 'Completed'
  | 'Fail'

export type DeliveryPlanState = {
  id?: number
  client_id: string
  name: PlanStates
  index?: number | null
  color?: string | null
  is_system?: boolean
  team_id?: number | null
}

export type DeliveryPlanStateMap = {
  byClientId: Record<string, DeliveryPlanState>
  allIds: string[]
}
