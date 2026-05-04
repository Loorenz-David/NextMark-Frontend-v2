import type { Order, RouteSolution, RouteSolutionStop, address } from '@shared-domain'
import type { DriverWorkspaceScopeKey } from './driverSession.types'

export type SyncExecutionState =
  | 'idle'
  | 'submitting'
  | 'retryable_failure'
  | 'terminal_failure'
  | 'synced'

export type DriverRouteActionType =
  | 'start-route'
  | 'arrive-stop'
  | 'complete-stop'
  | 'undo-stop-terminal'
  | 'skip-stop'
  | 'fail-stop'
  | 'update-stop-note'

export type DriverRouteActionCommand = {
  type: DriverRouteActionType
  routeClientId: string
  stopClientId?: string
  orderId?: number
  note?: string
}

export type DriverCommandEnvelope<TCommand> = {
  clientCommandId: string
  workspaceScopeKey: DriverWorkspaceScopeKey
  issuedAt: string
  command: TCommand
}

export type DriverRouteActionResult = {
  syncState: SyncExecutionState
  route?: AssignedRouteViewModel | null
  message?: string
}

export type AssignedStopOrderItemPropertyViewModel = {
  label: string
  value: string
}

export type AssignedStopOrderItemViewModel = {
  clientId: string
  itemType: string | null
  articleNumber: string | null
  referenceNumber: string | null
  quantity: number | null
  weight: number | null
  pageLink: string | null
  itemImages: string[]
  dimensionsLabel: string | null
  properties: AssignedStopOrderItemPropertyViewModel[]
}

export type AssignedStopViewModel = {
  stopClientId: string
  stopOrder: number | null
  etaStatus: string | null
  expectedArrivalTime: string | null
  expectedDepartureTime: string | null
  serviceLabel: string
  serviceDurationLabel: string | null
  title: string
  secondaryAddressLine: string | null
  itemSummary: string | null
  orderItems: AssignedStopOrderItemViewModel[]
  phoneLine: string | null
  badgeLabel: string | null
  searchText: string
  order: Order | null
  address: address | null
  isActive: boolean
  isCompleted: boolean
}

export type AssignedStopCustomerViewModel = {
  fullName: string | null
  email: string | null
  primaryPhone: string | null
  secondaryPhone: string | null
  addressLine: string | null
  costumerId: number | null
}

export type AssignedRouteViewModel = {
  routeClientId: string
  label: string
  score: number | null
  deliveryPlanStartDate: string | null
  deliveryPlanEndDate: string | null
  startLocation: address | null
  endLocation: address | null
  activeStopClientId: string | null
  completedStops: number
  totalStops: number
  route: RouteSolution | null
  rawStops: RouteSolutionStop[]
  stops: AssignedStopViewModel[]
}

export type QuickOrderDraft = {
  referenceNumber: string
  customerName: string
  customerPhone: string
  streetAddress: string
  city: string
}

export type QuickRouteDraft = {
  label: string
  startAddress: string
  endAddress: string
  selectedOrderClientIds: string[]
}
