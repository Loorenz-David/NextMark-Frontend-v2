// Public barrel for local-delivery-orders feature

// Pages
export { RouteGroupsPage } from './pages/LocalDelivery.page'
export { LocalDeliveryPageContent } from './pages/LocalDeliveryPageContent.page'
export { RouteGroupStatsPage } from './pages/LocalDeliveryStats.page'

// Provider & Context
export { LocalDeliveryProvider } from './context/LocalDelivery.provider'
export { useLocalDeliveryContext } from './context/useLocalDeliveryContext'

// Store & Selectors
export { useLocalDeliveryPlanStore } from './store/localDelivery.slice'
export { useRouteSolutionStore } from './store/routeSolution.store'
export { useRouteSolutionStopStore } from './store/routeSolutionStop.store'
export { selectAllLocalDeliveryPlans, selectLocalDeliveryPlanByServerId } from './store/localDelivery.slice'

// DND Controller (for home integration)
export { usePlanOrderDndController } from './dnd/usePlanOrderDndController'

// Types
export type { LocalDeliveryPlan } from './types/localDeliveryPlan'
export type { RouteSolution } from './types/routeSolution'
export type { RouteSolutionStop } from './types/routeSolutionStop'
