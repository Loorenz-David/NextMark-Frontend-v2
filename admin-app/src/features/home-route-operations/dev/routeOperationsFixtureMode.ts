const ROUTE_OPERATIONS_FIXTURE_MODE_KEY = 'admin:route-ops-fixtures'

export const getRouteOperationsFixtureModeKey = () => ROUTE_OPERATIONS_FIXTURE_MODE_KEY

export const isRouteOperationsFixtureModeEnabled = () => {
  if (!import.meta.env.DEV) return false
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ROUTE_OPERATIONS_FIXTURE_MODE_KEY) === 'true'
}
