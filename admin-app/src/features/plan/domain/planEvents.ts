export type PlanEventDefinition = {
  key: string
  label: string
  description?: string
}

export const PLAN_EVENTS: PlanEventDefinition[] = [
{ key: 'delivery_plan_rescheduled', label: 'Plan rescheduled', description: 'Triggered when a delivery plan is rescheduled, sends the template message to all orders within that plan.' },
]