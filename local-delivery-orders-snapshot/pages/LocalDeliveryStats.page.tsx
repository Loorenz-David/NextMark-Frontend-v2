import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { address } from '@/types/address'
import { SectionHeader } from '@/shared/section-panel/SectionHeader'
import { DimensionsIcon, ItemIcon, OrderIcon, StatsIcon, WeightIcon } from '@/assets/icons'
import { formatMetric } from '@shared-utils'
import { formatIsoToTeamTimeZone } from '@/shared/utils/teamTimeZone'
import { coerceUtcFromOffset } from '@/shared/data-validation/timeValidation'
import { formatRouteTime } from '@/features/local-delivery-orders/utils/formatRouteTime'
import { useOrdersByPlanId } from '@/features/order/store/orderHooks.store'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import { useLocalDeliveryPlanByPlanId, useLocalDeliveryPlanByServerId } from '@/features/local-delivery-orders/store/useLocalDeliveryPlan.selector'
import { useSelectedRouteSolutionByLocalDeliveryPlanId } from '@/features/local-delivery-orders/store/useRouteSolution.selector'
import { selectRouteSolutionStopsBySolutionId, useRouteSolutionStopStore } from '@/features/local-delivery-orders/store/routeSolutionStop.store'
import { useTeamMemberByServerId } from '@/features/team/members/hooks/useTeamMemberSelectors'

type LocalDeliveryStatsPayload = {
  localDeliveryPlanId?: number | string | null
  planId?: number | string | null
}

type RouteGroupStatsPageProps = {
  payload: LocalDeliveryStatsPayload
}

type StatItemProps = {
  label: string
  value: React.ReactNode
  note?: string | null
}

type StatIconItemProps = {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
}

type StatsSectionProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}



export const RouteGroupStatsPage = ({ payload }: RouteGroupStatsPageProps) => {
  const planId = resolveId(payload?.planId)
  const payloadLocalDeliveryPlanId = resolveId(payload?.localDeliveryPlanId)
  const localDeliveryPlanFromPlan = useLocalDeliveryPlanByPlanId(planId)
  const localDeliveryPlanFromId = useLocalDeliveryPlanByServerId(payloadLocalDeliveryPlanId)
  const localDeliveryPlan = localDeliveryPlanFromId ?? localDeliveryPlanFromPlan
  const localDeliveryPlanId = payloadLocalDeliveryPlanId ?? localDeliveryPlan?.id ?? null
  const plan = useRoutePlanByServerId(planId ?? localDeliveryPlan?.route_plan_id ?? null)
  const orders = useOrdersByPlanId( plan?.id ?? planId ?? localDeliveryPlan?.route_plan_id ?? null )
  const routeSolution = useSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId)
  const routeStops = useRouteSolutionStopStore(
    useShallow(selectRouteSolutionStopsBySolutionId(routeSolution?.id ?? null)),
  )
  const driver = useTeamMemberByServerId(routeSolution?.driver_id ?? null)

  const headerTitle = routeSolution?.label ?? 'Route Stats'

  const startDate = formatDate(plan?.start_date)
  const endDate = formatDate(plan?.end_date)
  const startTime = routeSolution?.set_start_time ?? '—'
  const endTime = routeSolution?.set_end_time ?? '—'
  const expectedStartDate = formatDateFromIso(routeSolution?.expected_start_time ?? null)
  const expectedEndDate = formatDateFromIso(routeSolution?.expected_end_time ?? null)
  const expectedStartTime = formatTimeFromIso(routeSolution?.expected_start_time ?? null)
  const expectedEndTime = formatTimeFromIso(routeSolution?.expected_end_time ?? null)
  const totalOrders = plan?.total_orders ?? null
  const totalItems = plan?.total_items ?? null
  const totalVolume = plan?.total_volume ?? null
  const totalWeight = plan?.total_weight ?? null
  const orderedStops = useMemo(
    () =>
      [...routeStops].sort(
        (a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY),
      ),
    [routeStops],
  )
  const ordersById = useMemo(() => {
    const map = new Map<number, (typeof orders)[number]>()
    orders.forEach((order) => {
      if (order.id != null) {
        map.set(order.id, order)
      }
    })
    return map
  }, [orders])
  const firstStop = orderedStops[0]
  const lastStop = orderedStops[orderedStops.length - 1]
  const firstOrder = firstStop?.order_id ? ordersById.get(firstStop.order_id) ?? null : null
  const lastOrder = lastStop?.order_id ? ordersById.get(lastStop.order_id) ?? null : null
  const resolvedStartLocation = routeSolution?.start_location ?? firstOrder?.client_address ?? null
  const resolvedEndLocation = routeSolution?.end_location ?? lastOrder?.client_address ?? null
  const startLocationNote = isSameAddress(resolvedStartLocation, firstOrder?.client_address)
    ? 'First order'
    : null
  const endLocationNote = isSameAddress(resolvedEndLocation, lastOrder?.client_address)
    ? 'Last order'
    : null

  const routeWarnings = useMemo(() => {
    if (!routeSolution?.has_route_warnings) return []
    return Array.isArray(routeSolution.route_warnings) ? routeSolution.route_warnings : []
  }, [routeSolution?.has_route_warnings, routeSolution?.route_warnings])

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-primary)]/2 overflow-y-auto scroll-thin">
      <SectionHeader
        title={headerTitle}
        headerButtonsBgClass={"bg-[var(--color-primary)]/2"}
        icon={<StatsIcon className="w-6 h-6 stroke-[var(--color-muted)]" />}
        closeButton={true}
      />
      <div className="flex flex-col gap-6 p-6">
        <StatsSection title="Set schedule">
          <div className="grid gap-4 md:grid-cols-2">
            <StatItem label="Start date" value={startDate} />
            <StatItem label="End date" value={endDate} />
            <StatItem label="Start time" value={startTime} />
            <StatItem label="End time" value={endTime} />
          </div>
        </StatsSection>

        <StatsSection title="Route">
          <div className="grid gap-4 md:grid-cols-2">
            <StatItem
              label="Start location"
              value={<AddressDisplay value={resolvedStartLocation} />}
              note={startLocationNote}
            />
            <StatItem
              label="End location"
              value={<AddressDisplay value={resolvedEndLocation} />}
              note={endLocationNote}
            />
            <StatItem
              label="Total distance"
              value={formatDistance(routeSolution?.total_distance_meters ?? null)}
            />
            <StatItem
              label="Total time"
              value={formatDuration(routeSolution?.total_travel_time_seconds ?? null)}
            />
            <StatItem
              label="Optimization status"
              value={formatOptimizeStatus(routeSolution?.is_optimized ?? null)}
            />
            <StatItem label="Driver" value={driver?.username ?? driver?.email ?? '—'} />
          </div>
        </StatsSection>
        
        <StatsSection title="Plan totals">
          <div className="grid gap-4 md:grid-cols-2">
            <StatIconItem
              label="Total orders"
              value={totalOrders ?? '—'}
              icon={<OrderIcon className="h-4 w-4 app-icon" />}
            />
            <StatIconItem
              label="Total items"
              value={totalItems ?? '—'}
              icon={<ItemIcon className="h-4 w-4 app-icon" />}
            />
            <StatIconItem
              label="Total weight"
              value={totalWeight != null ? formatMetric(totalWeight, 'kg') : '—'}
              icon={<WeightIcon className="h-4 w-4 app-icon" />}
            />
            <StatIconItem
              label="Total volume"
              value={totalVolume != null ? formatMetric(totalVolume, '㎥') : '—'}
              icon={<DimensionsIcon className="h-4 w-4 app-icon" />}
            />
          </div>
        </StatsSection>

        <StatsSection title="Expected timing" subtitle="Optimization">
          <div className="grid gap-4 md:grid-cols-2">
            <StatItem label="Expected start date" value={expectedStartDate} />
            <StatItem label="Expected end date" value={expectedEndDate} />
            <StatItem label="Expected start time" value={expectedStartTime} />
            <StatItem label="Expected end time" value={expectedEndTime} />
          </div>
        </StatsSection>

        {routeWarnings.length ? (
          <StatsSection title="Route warnings">
            <div className="grid gap-3">
              {routeWarnings.map((warning, index) => {
                const message = (warning.message as string | undefined) ?? 'Warning'
                const meta = buildWarningMeta(warning, plan?.start_date ?? null)
                return (
                  <div
                    key={`${warning.type ?? 'warning'}-${index}`}
                    className="rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-muted)]/5 px-4 py-3"
                  >
                    <div className="text-sm font-medium text-[var(--color-text)]">{message}</div>
                    {meta ? (
                      <div className="text-xs text-[var(--color-muted)]">{meta}</div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </StatsSection>
        ) : null}
      </div>
    </div>
  )
}


const resolveId = (value: number | string | null | undefined) => {
  if (value == null) return null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return value
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const teamIso = formatIsoToTeamTimeZone(value)
  const date = coerceUtcFromOffset(teamIso)
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateFromIso = (value?: string | null) => {
  if (!value) return '—'
  const teamIso = formatIsoToTeamTimeZone(value)
  const date = coerceUtcFromOffset(teamIso)
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTimeFromIso = (value?: string | null) =>
  formatRouteTime(value, null)

const formatDistance = (meters?: number | null) => {
  if (!Number.isFinite(meters)) return '—'
  if ((meters ?? 0) < 1000) return `${Math.round(meters ?? 0)} m`
  const km = (meters ?? 0) / 1000
  return `${km.toFixed(1)} km`
}

const formatDuration = (seconds?: number | null) => {
  if (!Number.isFinite(seconds)) return '—'
  const totalSeconds = Math.max(0, Math.round(seconds ?? 0))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const AddressDisplay = ({ value }: { value?: address | null }) => {
  if (!value) return '—'
  const street = value.street_address
  const postal = value.postal_code
  const city = value.city
  const country = value.country

  if (!street && !postal && !city && !country) return '—'

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {[street, postal].filter(Boolean).join(' ')}
      </span>
      <span className="text-xs text-[var(--color-muted)]">
        {[city, country].filter(Boolean).join(', ')}
      </span>
    </div>
  )
}

const normalizeText = (value?: string | null) =>
  (value ?? '').trim().toLowerCase() || null

const extractCoordinates = (value?: address | null) => {
  if (!value) return { lat: null, lng: null }
  const coords = value.coordinates as
    | { lat?: number; lng?: number; latitude?: number; longitude?: number }
    | undefined
  const lat = coords?.lat ?? coords?.latitude ?? null
  const lng = coords?.lng ?? coords?.longitude ?? null
  return { lat, lng }
}

const addressSignature = (value?: address | null) => {
  if (!value) return null
  const coords = extractCoordinates(value)
  return JSON.stringify({
    street_address: normalizeText(value.street_address),
    city: normalizeText(value.city),
    postal_code: normalizeText(value.postal_code),
    country: normalizeText(value.country),
    lat: coords.lat,
    lng: coords.lng,
  })
}

const isSameAddress = (left?: address | null, right?: address | null) =>
  Boolean(left && right && addressSignature(left) === addressSignature(right))

const formatOptimizeStatus = (value?: string | null) => {
  if (!value) return '—'
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const buildWarningMeta = (warning: Record<string, unknown>, planStartDate?: string | null) => {
  if (typeof warning.route_expected_end === 'string' || typeof warning.route_allowed_end === 'string') {
    const expected = formatRouteTime(warning.route_expected_end as string | null, planStartDate)
    const allowed = formatRouteTime(warning.route_allowed_end as string | null, planStartDate)
    return `Expected ${expected} · Allowed ${allowed}`
  }
  if (typeof warning.expected_time === 'string') {
    const expected = formatRouteTime(warning.expected_time as string | null, planStartDate)
    return `Expected ${expected}`
  }
  return null
}

const StatItem = ({ label, value, note }: StatItemProps) => (
  <div>
    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
      <span>{label}</span>
      {note ? (
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          {note}
        </span>
      ) : null}
    </div>
    <div>{value}</div>
  </div>
)

const StatIconItem = ({ label, value, icon }: StatIconItemProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <StatItem label={label} value={value} />
  </div>
)

const StatsSection = ({ title, subtitle, children }: StatsSectionProps) => (
  <div className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-[var(--color-muted)]">{title}</h3>
      {subtitle ? (
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          {subtitle}
        </span>
      ) : null}
    </div>
    {children}
  </div>
)
