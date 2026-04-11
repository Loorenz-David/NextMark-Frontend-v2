import { ORDER_EVENTS } from "@/features/order/domain/orderEvents"
import { PLAN_EVENTS } from "@/features/plan/domain/planEvents"


export type EventDefinition = {
  key: string
  label: string
  description?: string
}

export const EMAIL_EVENTS: EventDefinition[] = [
    ...ORDER_EVENTS,
    ...PLAN_EVENTS,
]
    