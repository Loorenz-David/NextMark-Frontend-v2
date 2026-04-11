export const REALTIME_SERVER_EVENTS = {
  businessEvent: 'realtime:event',
  error: 'realtime:error',
  driverLocationUpdated: 'driver_location.updated',
  driverLocationSnapshot: 'driver_location.snapshot',
  notificationEvent: 'notification:event',
  notificationSnapshot: 'notification:snapshot',
  externalFormReceived: 'external_form:received',
  externalFormRequested: 'external_form:requested',
  clientFormSubmitted: 'client_form:submitted',
} as const

export const REALTIME_CLIENT_EVENTS = {
  subscribe: 'realtime:subscribe',
  unsubscribe: 'realtime:unsubscribe',
  driverLocationPublish: 'driver_location:publish',
  notificationMarkRead: 'notification:mark_read',
  externalFormJoinUser: 'external_form:join_user',
  externalFormLeaveUser: 'external_form:leave_user',
  externalFormSubmitUser: 'external_form:submit_user',
  externalFormRequestUser: 'external_form:request_user',
} as const

export const REALTIME_CHANNELS = {
  teamAdmin: 'team_admin',
  teamMembers: 'team_members',
  teamOrders: 'team_orders',
  teamOrderCases: 'team_order_cases',
  routeOrders: 'route_orders',
  teamDriverLive: 'team_driver_live',
  orderChat: 'order_chat',
} as const

export type RealtimeChannelId = (typeof REALTIME_CHANNELS)[keyof typeof REALTIME_CHANNELS]

export type RealtimeChannelParamsMap = {
  team_admin: Record<string, never>
  team_members: Record<string, never>
  team_orders: Record<string, never>
  team_order_cases: Record<string, never>
  route_orders: { route_id: number }
  team_driver_live: Record<string, never>
  order_chat: { order_id: number }
}

export type BusinessEventName =
  | 'order.created'
  | 'order.updated'
  | 'order.state_changed'
  | 'order_case.created'
  | 'order_case.updated'
  | 'order_case.state_changed'
  | 'delivery_plan.created'
  | 'delivery_plan.updated'
  | 'delivery_plan.deleted'
  | 'local_delivery_plan.updated'
  | 'route_solution.created'
  | 'route_solution.updated'
  | 'route_solution.deleted'
  | 'route_solution_stop.updated'
  | 'order_chat.message_created'

export const ADMIN_BUSINESS_EVENT_NAMES = [
  'order.created',
  'order.updated',
  'order.state_changed',
  'order_case.created',
  'order_case.updated',
  'order_case.state_changed',
  'order_chat.message_created',
  'delivery_plan.created',
  'delivery_plan.updated',
  'delivery_plan.deleted',
  'local_delivery_plan.updated',
  'route_solution.created',
  'route_solution.updated',
  'route_solution.deleted',
  'route_solution_stop.updated',
] as const satisfies readonly BusinessEventName[]

export const DRIVER_BUSINESS_EVENT_NAMES = [
  'order.created',
  'order.updated',
  'order.state_changed',
  'order_case.created',
  'order_case.updated',
  'order_case.state_changed',
  'order_chat.message_created',
  'local_delivery_plan.updated',
  'route_solution.created',
  'route_solution.updated',
  'route_solution.deleted',
  'route_solution_stop.updated',
] as const satisfies readonly BusinessEventName[]

export type BusinessEntityType =
  | 'order'
  | 'order_case'
  | 'order_chat'
  | 'delivery_plan'
  | 'local_delivery_plan'
  | 'route_solution'
  | 'route_solution_stop'
  | 'app_event'

export const BUSINESS_ENTITY_TYPES = [
  'order',
  'order_case',
  'order_chat',
  'delivery_plan',
  'local_delivery_plan',
  'route_solution',
  'route_solution_stop',
  'app_event',
] as const satisfies readonly BusinessEntityType[]

export type BusinessEventEnvelope<TPayload = Record<string, unknown>> = {
  event_id: string
  event_name: BusinessEventName
  version: number
  occurred_at: string
  team_id: number | null
  entity_type: BusinessEntityType
  entity_id: number | null
  app_scopes: string[]
  payload: TPayload
}

export type DriverLocationPoint = {
  lat: number
  lng: number
}

export type DriverLocationUpdatedPayload = {
  driver_id: number
  team_id: number | null
  coords: DriverLocationPoint
  timestamp: string
}

export type DriverLocationSnapshotPayload = {
  positions: DriverLocationUpdatedPayload[]
}

export type ExternalFormSubmitPayload<TFormData> = {
  user_id: number
  form_data: TFormData
}

export type ExternalFormRequestPayload = {
  user_id: number
  request_data?: Record<string, unknown>
}

export type ExternalFormReceivedPayload<TFormData> = {
  form_data: TFormData
  submitted_by: number
}

export type ExternalFormRequestedPayload = {
  request_data?: Record<string, unknown>
  requested_by: number
}

export type ClientFormSubmittedPayload = {
  order_id: number
  order_reference: string
}

export type NotificationTargetKind =
  | 'order_detail'
  | 'order_case_detail'
  | 'order_case_chat'
  | 'route_execution'
  | 'local_delivery_workspace'
  | 'driver_order_case_chat'

export type NotificationTarget = {
  kind: NotificationTargetKind
  route: string
  params: {
    planId?: number
    localDeliveryPlanId?: number
    routeSolutionId?: number
    routeSolutionStopId?: number
    orderId?: number
    orderCaseId?: number
    orderCaseClientId?: string
    routeId?: number
  }
}

export type NotificationItem = {
  notification_id: string
  event_id: string
  kind: BusinessEventName
  entity_type:
    | 'order'
    | 'order_case'
    | 'order_chat'
    | 'delivery_plan'
    | 'local_delivery_plan'
    | 'route_solution'
    | 'route_solution_stop'
  entity_id: number | null
  plan_id?: number
  local_delivery_plan_id?: number
  route_solution_id?: number
  route_solution_stop_id?: number
  route_freshness_updated_at?: string
  order_id?: number
  order_case_id?: number
  team_id: number | null
  actor_user_id?: number | null
  actor_username?: string | null
  title: string
  description: string
  occurred_at: string
  target: NotificationTarget
  read: boolean
}

export type NotificationSnapshotPayload = {
  notifications: NotificationItem[]
  unread_count: number
}

export type NotificationMarkReadPayload = {
  notification_ids: string[]
}

export type RealtimeSubscriptionPayload<Channel extends RealtimeChannelId = RealtimeChannelId> = {
  channel: Channel
  params?: RealtimeChannelParamsMap[Channel]
}

export type RealtimeErrorPayload = {
  code: string
  error: string
}
