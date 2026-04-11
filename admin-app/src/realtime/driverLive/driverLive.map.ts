import type { DriverLocationUpdatedPayload } from '@shared-realtime'

import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { MapOrder } from '@/shared/map'

export const DRIVER_LIVE_ACTIVE_MAX_AGE_MS = 5 * 60 * 1000

export type DriverLocationMarkerActivity = 'active' | 'passive'
export type DriverLocationMarkerScope = 'route-group' | 'orders'
export type DriverActiveRouteContext = {
  planId: number
  routeGroupId: number
  routeSolutionId: number | null
}

const parseTimestamp = (value?: string | null): number | null => {
  if (!value) return null
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

const getMarkerId = (scope: DriverLocationMarkerScope, driverId: number) =>
  `driver-live:${scope}:${driverId}`

export const resolveDriverLocationActivity = (
  position: DriverLocationUpdatedPayload,
  now = Date.now(),
): DriverLocationMarkerActivity => {
  const timestamp = parseTimestamp(position.timestamp)
  if (timestamp == null) return 'passive'
  return now - timestamp <= DRIVER_LIVE_ACTIVE_MAX_AGE_MS ? 'active' : 'passive'
}

export const buildDriverLocationMarkerClassName = (
  activity: DriverLocationMarkerActivity,
) => `driver-live-marker driver-live-marker--${activity}`

export const buildDriverLocationMarker = ({
  scope,
  position,
  onClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  scope: DriverLocationMarkerScope
  position: DriverLocationUpdatedPayload
  onClick: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder => {
  const activity = resolveDriverLocationActivity(position, now)

  return {
    id: getMarkerId(scope, position.driver_id),
    coordinates: position.coords,
    className: buildDriverLocationMarkerClassName(activity),
    onClick,
    onMouseEnter: onMouseEnter
      ? (event: MouseEvent) => onMouseEnter(event, position)
      : undefined,
    onMouseLeave: onMouseLeave
      ? (event: MouseEvent) => onMouseLeave(event, position)
      : undefined,
  }
}

export const buildRouteGroupDriverLocationMarkers = ({
  positions,
  selectedDriverId,
  onClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  positions: DriverLocationUpdatedPayload[]
  selectedDriverId: number | null | undefined
  onClick: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder[] => {
  if (selectedDriverId == null) return []

  return positions
    .filter((position) => position.driver_id === selectedDriverId)
    .map((position) =>
      buildDriverLocationMarker({
        scope: 'route-group',
        position,
        onClick,
        onMouseEnter,
        onMouseLeave,
        now,
      }),
    )
}

export const buildOrderDriverLocationMarkers = ({
  positions,
  resolveRouteContextByDriverId,
  onResolvedRouteContextClick,
  onMouseEnter,
  onMouseLeave,
  now = Date.now(),
}: {
  positions: DriverLocationUpdatedPayload[]
  resolveRouteContextByDriverId: (driverId: number) => DriverActiveRouteContext | null
  onResolvedRouteContextClick: (context: DriverActiveRouteContext) => void | Promise<void>
  onMouseEnter?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  onMouseLeave?: (event: MouseEvent, position: DriverLocationUpdatedPayload) => void
  now?: number
}): MapOrder[] =>
  positions.map((position) =>
    buildDriverLocationMarker({
      scope: 'orders',
      position,
      onClick: () => {
        const context = resolveRouteContextByDriverId(position.driver_id)
        if (context) {
          void onResolvedRouteContextClick(context)
        }
      },
      onMouseEnter,
      onMouseLeave,
      now,
    }),
  )

export const resolveActiveRoutePlanIdByDriverId = ({
  driverId,
  routeSolutions,
  routeGroups,
}: {
  driverId: number
  routeSolutions: RouteSolution[]
  routeGroups: RouteGroup[]
}): number | null => {
  const bestMatch = routeSolutions
    .filter(
      (solution) => solution.driver_id === driverId,
    )
    .sort((left, right) => {
      const leftTime = parseTimestamp(left.actual_start_time) ?? Number.NEGATIVE_INFINITY
      const rightTime = parseTimestamp(right.actual_start_time) ?? Number.NEGATIVE_INFINITY
      return rightTime - leftTime
    })[0]

  if (!bestMatch?.route_group_id) {
    return null
  }

  const routeGroup = routeGroups.find(
    (plan) => plan.id === bestMatch.route_group_id,
  )

  return routeGroup?.route_plan_id ?? null
}

export const resolveActiveRouteContextByDriverId = ({
  driverId,
  routeSolutions,
  routeGroups,
}: {
  driverId: number
  routeSolutions: RouteSolution[]
  routeGroups: RouteGroup[]
}): { planId: number; routeGroupId: number; routeSolutionId: number | null } | null => {
  const bestMatch = routeSolutions
    .filter(
      (solution) => solution.driver_id === driverId,
    )
    .sort((left, right) => {
      const leftTime = parseTimestamp(left.actual_start_time) ?? Number.NEGATIVE_INFINITY
      const rightTime = parseTimestamp(right.actual_start_time) ?? Number.NEGATIVE_INFINITY
      return rightTime - leftTime
    })[0]

  if (!bestMatch?.route_group_id) {
    return null
  }

  const routeGroup = routeGroups.find(
    (group) => group.id === bestMatch.route_group_id,
  )

  if (!routeGroup?.route_plan_id) {
    return null
  }

  return {
    planId: routeGroup.route_plan_id,
    routeGroupId: bestMatch.route_group_id,
    routeSolutionId: bestMatch.id ?? null,
  }
}
