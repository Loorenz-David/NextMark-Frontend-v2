import type { ClassicTemplateRouteProps } from '@/features/templates/printDocument/components/templates/route/classicTemplateRoute'

import { toDateOnly, validateDateComparison } from '@/shared/data-validation/timeValidation'

import type { address } from '@/types/address'


import { useRoutePlanStore, selectRoutePlanByServerId } from '@/features/plan/store/routePlan.slice'

import {
  useRouteSolutionStore,
  selectSelectedRouteSolutionByRouteGroupId,
} from '@/features/plan/routeGroup/store/routeSolution.store'

import {
  useRouteSolutionStopStore,
  selectRouteSolutionStopsBySolutionId,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'

import { useOrderStore, selectOrderByServerId } from '@/features/order/store/order.store'

import { useItemStore, selectItemsByOrderId } from '@/features/order/item/store/item.store'

import { useTeamMemberStore, selectTeamMemberByServerId } from '@/features/team/members/store/teamMemberStore'



export const serializeRouteSolutionForTemplate = (
  planId: number | null | undefined,
  routeGroupId: number | null | undefined,
): ClassicTemplateRouteProps | null => {
  if (!planId || !routeGroupId) return null

  const plan = selectRoutePlanByServerId(planId)(useRoutePlanStore.getState())

  const routeSolution = selectSelectedRouteSolutionByRouteGroupId(routeGroupId)(
    useRouteSolutionStore.getState(),
  )

  if (!plan || !routeSolution?.id) return null

  const routeStartIso = routeSolution.expected_start_time ?? null
  const routeEndIso = routeSolution.expected_end_time ?? null

  const spansMultipleDays = !validateDateComparison(
    routeStartIso ?? '',
    routeEndIso ?? '',
    'are_equal_dates',
  )

  const stops = selectRouteSolutionStopsBySolutionId(routeSolution.id)(useRouteSolutionStopStore.getState())

  let itemCountTotal = 0
  let weightTotal = 0
  let volumeTotal = 0
  const itemTypeSummary = new Map<
    string,
    { item_type: string; quantity: number; total_weight: number; total_volume: number }
  >()

  const orders = stops
    .slice()
    .sort((a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY))
    .map((stop) => {
      const order = stop.order_id
        ? selectOrderByServerId(stop.order_id)(useOrderStore.getState())
        : null

      const items = stop.order_id ? selectItemsByOrderId(stop.order_id)(useItemStore.getState()) : []

      for (const it of items) {
        const q = it.quantity ?? 0
        itemCountTotal += q
        const itemTypeKey = it.item_type?.trim() || 'Unknown item type'
        const summaryEntry = itemTypeSummary.get(itemTypeKey) ?? {
          item_type: itemTypeKey,
          quantity: 0,
          total_weight: 0,
          total_volume: 0,
        }
        summaryEntry.quantity += q

        if (typeof it.weight === 'number') {
          weightTotal += it.weight * q
          summaryEntry.total_weight += it.weight * q
        }

        if (
          typeof it.dimension_depth === 'number' &&
          typeof it.dimension_height === 'number' &&
          typeof it.dimension_width === 'number'
        ) {
          const itemVolume = it.dimension_depth * it.dimension_height * it.dimension_width * q
          volumeTotal += itemVolume
          summaryEntry.total_volume += itemVolume
        }

        itemTypeSummary.set(itemTypeKey, summaryEntry)
      }

      return {
        stop_order: stop.stop_order ?? null,
        order_scalar_id: order?.order_scalar_id ?? null,
        client_address: formatAddress(order?.client_address),
        expected_arrival_time: formatRouteTime(stop.expected_arrival_time, spansMultipleDays),
        items: items.map((it) => ({
          article_number: it.article_number,
          item_type: it.item_type,
          quantity: it.quantity,
          properties: it.properties ?? null,
        })),
      }
    })

  const travelTimeFromSolution = secondsToHHMM(routeSolution.total_travel_time_seconds)

  return {
    orientation: 'vertical',
    plan_date: formatPlanDate(plan.start_date, plan.end_date),
    stop_count: routeSolution.stop_count ?? orders.length,
    total_distance: metersToKm(routeSolution.total_distance_meters),
    total_travel_time:
      travelTimeFromSolution !== '--' ? travelTimeFromSolution : diffIsoToHHMM(routeStartIso, routeEndIso),
    expected_start_time: formatRouteTime(routeStartIso, spansMultipleDays),
    expected_end_time: formatRouteTime(routeEndIso, spansMultipleDays),
    driver: resolveDriverName(routeSolution.driver_id),
    item_count: itemCountTotal,
    total_weight: weightTotal,
    total_volume: volumeTotal,
    item_type_summary: Array.from(itemTypeSummary.values()).sort((left, right) => {
      if (right.quantity !== left.quantity) return right.quantity - left.quantity
      return left.item_type.localeCompare(right.item_type)
    }),
    orders,
  }
}



const toTimeOnly = (iso?: string | null): string => {
  if (!iso) return '--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const toDateTime = (iso?: string | null): string => {
  if (!iso) return '--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

const formatRouteTime = (
  iso: string | null | undefined,
  spansMultipleDays: boolean,
) => (spansMultipleDays ? toDateTime(iso) : toTimeOnly(iso))

const formatPlanDate = (
  startIso?: string | null,
  endIso?: string | null,
): string => {
  const start = startIso ?? ''
  const end = endIso ?? ''

  if (validateDateComparison(start, end, 'are_equal_dates')) {
    return toDateOnly(start)
  }

  return `${toDateOnly(start)}  --  ${toDateOnly(end)}`
}

const formatAddress = (addr?: address | null): string => {
  if (!addr?.street_address) return '--'

  const parts: string[] = [addr.street_address]

  if (addr.postal_code) parts.push(addr.postal_code)
  if (addr.city) parts.push(addr.city)
  if (addr.country) parts.push(addr.country)

  return parts.join(', ')
}

const secondsToHHMM = (seconds?: number | null): string => {
  if (typeof seconds !== 'number' || seconds < 0) return '--'
  const totalMinutes = Math.floor(seconds / 60)
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

const diffIsoToHHMM = (startIso?: string | null, endIso?: string | null): string => {
  if (!startIso || !endIso) return '--'
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '--'
  return secondsToHHMM(Math.floor((end - start) / 1000))
}

const metersToKm = (meters?: number | null): number | null => {
  if (typeof meters !== 'number' || meters < 0) return null
  return meters / 1000
}

const resolveDriverName = (driverId?: number | null): string => {
  if (!driverId) return '--'

  const member= selectTeamMemberByServerId(driverId)(
    useTeamMemberStore.getState(),
  )

  return member?.username ?? '--'
}
