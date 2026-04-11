import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import { formatIsoToTeamTime } from '@/app/utils/teamTimeZone'
import type { AssignedRoutePageDisplay } from './assignedRouteDisplay.types'
import { mapStopOrderNotes } from './mapStopRowOrderNote'

function formatTimeLabel(value: string | null | undefined) {
  return formatIsoToTeamTime(value, { locale: 'sv-SE' })
}

function formatDistanceLabel(distanceMeters: number | null | undefined) {
  if (typeof distanceMeters !== 'number' || Number.isNaN(distanceMeters)) {
    return null
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function formatStopCountLabel(totalStops: number) {
  return `${totalStops} stop${totalStops === 1 ? '' : 's'}`
}

function formatItemCountLabel(itemCount: number) {
  return `${itemCount} item${itemCount === 1 ? '' : 's'}`
}

function formatAddressLine(routeAddress: AssignedRouteViewModel['startLocation'] | AssignedRouteViewModel['endLocation']) {
  if (!routeAddress) {
    return null
  }

  const parts = [
    routeAddress.street_address,
    routeAddress.postal_code,
    routeAddress.city,
  ].filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(', ') : null
}

export function mapAssignedRouteToPageDisplay(
  route: AssignedRouteViewModel | null,
  status: 'idle' | 'loading' | 'ready' | 'error',
  error?: string,
): AssignedRoutePageDisplay {
  if (status === 'loading' || status === 'idle') {
    return {
      state: 'loading',
      summary: null,
      timeline: null,
      footerLabel: 'Mark route as completed',
    }
  }

  if (!route) {
    return {
      state: 'empty',
      emptyMessage: error ?? 'No route selected.',
      summary: null,
      timeline: null,
      footerLabel: 'Mark route as completed',
    }
  }

  return {
    state: 'ready',
    summary: {
      routeTitle: route.label,
      finishTimeLabel: formatTimeLabel(route.route?.expected_end_time ?? null),
      stopCountLabel: formatStopCountLabel(route.totalStops),
      distanceLabel: formatDistanceLabel(route.route?.total_distance_meters ?? null),
    },
    timeline: {
      start: {
        timeLabel: formatTimeLabel(route.route?.expected_start_time ?? null),
        title: 'Start location',
        addressLine: formatAddressLine(route.startLocation),
      },
      stops: route.stops.map((stop) => ({
        stopClientId: stop.stopClientId,
        stopIndexLabel: stop.stopOrder != null ? String(stop.stopOrder).padStart(2, '0') : null,
        timeLabel: formatTimeLabel(stop.expectedArrivalTime),
        title: stop.title,
        addressLine: stop.secondaryAddressLine,
        durationLabel: stop.serviceDurationLabel,
        itemSummary: stop.itemSummary,
        itemCountLabel: stop.orderItems.length > 0 ? formatItemCountLabel(stop.orderItems.length) : null,
        phoneLine: stop.phoneLine,
        orderNotes: mapStopOrderNotes(stop.order?.order_notes ?? null),
        badgeLabel: stop.badgeLabel,
        isActive: stop.isActive,
        isCompleted: stop.isCompleted,
      })),
      end: {
        timeLabel: formatTimeLabel(route.route?.expected_end_time ?? null),
        title: 'End location',
        addressLine: formatAddressLine(route.endLocation),
      },
    },
    footerLabel: 'Mark route as completed',
  }
}
