import type {
  RouteEndTimeExceededWarning,
  RouteSolutionWarning,
  VehicleMaxVolumeExceededWarning,
  VehicleMaxWeightExceededWarning,
  VehicleMaxDistanceExceededWarning,
  VehicleMaxDurationExceededWarning,
} from '@/features/plan/routeGroup/types/routeSolution'
import { formatRouteTime } from '@/features/plan/routeGroup/utils/formatRouteTime'

export const ROUTE_SOLUTION_WARNING_TYPES = {
  ROUTE_END_TIME_EXCEEDED: 'route_end_time_exceeded',
  VEHICLE_MAX_VOLUME_EXCEEDED: 'vehicle_max_volume_exceeded',
  VEHICLE_MAX_WEIGHT_EXCEEDED: 'vehicle_max_weight_exceeded',
  VEHICLE_MAX_DISTANCE_EXCEEDED: 'vehicle_max_distance_exceeded',
  VEHICLE_MAX_DURATION_EXCEEDED: 'vehicle_max_duration_exceeded',
} as const

export type RouteSolutionWarningRegistry = ReturnType<
  typeof createRouteSolutionWarningRegistry
>

export const createRouteSolutionWarningRegistry = () => {
  const registeredTypes = new Set<string>(Object.values(ROUTE_SOLUTION_WARNING_TYPES))
  const resolvableTypes = new Set<string>([
    ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED,
  ])

  const isRegistered = (type?: string) =>
    typeof type === 'string' && registeredTypes.has(type)
  const isResolvable = (type?: string) =>
    typeof type === 'string' && resolvableTypes.has(type)

  const isRouteEndTimeExceeded = (
    warning: RouteSolutionWarning,
  ): warning is RouteEndTimeExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED

  const isVehicleMaxVolumeExceeded = (
    warning: RouteSolutionWarning,
  ): warning is VehicleMaxVolumeExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.VEHICLE_MAX_VOLUME_EXCEEDED

  const isVehicleMaxWeightExceeded = (
    warning: RouteSolutionWarning,
  ): warning is VehicleMaxWeightExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.VEHICLE_MAX_WEIGHT_EXCEEDED

  const isVehicleMaxDistanceExceeded = (
    warning: RouteSolutionWarning,
  ): warning is VehicleMaxDistanceExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.VEHICLE_MAX_DISTANCE_EXCEEDED

  const isVehicleMaxDurationExceeded = (
    warning: RouteSolutionWarning,
  ): warning is VehicleMaxDurationExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.VEHICLE_MAX_DURATION_EXCEEDED

  const getMessage = (warning: RouteSolutionWarning): string => {
    if (typeof warning?.message === 'string' && warning.message.trim().length > 0) {
      return warning.message
    }
    if (isRouteEndTimeExceeded(warning)) return 'Route ends after allowed end time'
    if (isVehicleMaxVolumeExceeded(warning)) return 'Vehicle max volume exceeded'
    if (isVehicleMaxWeightExceeded(warning)) return 'Vehicle max weight exceeded'
    if (isVehicleMaxDistanceExceeded(warning)) return 'Vehicle max distance exceeded'
    if (isVehicleMaxDurationExceeded(warning)) return 'Vehicle max duration exceeded'
    return 'Route warning'
  }

  const getDisplayMeta = (
    warning: RouteSolutionWarning,
    planStartDate?: string | 'today' | null,
  ): Array<{ label: string; value: string }> => {
    if (isRouteEndTimeExceeded(warning)) {
      return [
        {
          label: 'Route expected end',
          value: formatRouteTime(warning.route_expected_end ?? null, planStartDate),
        },
        {
          label: 'Route allowed end',
          value: formatRouteTime(warning.route_allowed_end ?? null, planStartDate),
        },
      ]
    }
    if (isVehicleMaxVolumeExceeded(warning)) {
      return [
        { label: 'Total volume', value: `${warning.total_volume_cm3 ?? '—'} cm³` },
        { label: 'Vehicle max', value: `${warning.max_volume_cm3 ?? '—'} cm³` },
      ]
    }
    if (isVehicleMaxWeightExceeded(warning)) {
      const totalKg = warning.total_weight_g != null ? (warning.total_weight_g / 1000).toFixed(1) : '—'
      const maxKg = warning.max_weight_g != null ? (warning.max_weight_g / 1000).toFixed(1) : '—'
      return [
        { label: 'Total weight', value: `${totalKg} kg` },
        { label: 'Vehicle max', value: `${maxKg} kg` },
      ]
    }
    if (isVehicleMaxDistanceExceeded(warning)) {
      return [
        { label: 'Route distance', value: `${warning.total_distance_km ?? '—'} km` },
        { label: 'Vehicle max', value: `${warning.max_distance_km ?? '—'} km` },
      ]
    }
    if (isVehicleMaxDurationExceeded(warning)) {
      return [
        { label: 'Route duration', value: `${warning.total_duration_minutes ?? '—'} min` },
        { label: 'Vehicle max', value: `${warning.max_duration_minutes ?? '—'} min` },
      ]
    }
    return []
  }

  const getResolvableWarnings = (warnings: RouteSolutionWarning[]) =>
    warnings.filter((warning) => isResolvable(warning?.type))

  return {
    isRegistered,
    isResolvable,
    isRouteEndTimeExceeded,
    isVehicleMaxVolumeExceeded,
    isVehicleMaxWeightExceeded,
    isVehicleMaxDistanceExceeded,
    isVehicleMaxDurationExceeded,
    getMessage,
    getDisplayMeta,
    getResolvableWarnings,
  }
}
