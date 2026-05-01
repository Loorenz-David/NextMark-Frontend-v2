import { useEffect, useMemo, useRef, useState } from 'react'

import type { PayloadBase } from '@/features/home-route-operations/types/types'
import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import { useOrderStateRegistry } from '@/features/order/domain/useOrderStateRegistry'
import {
  computeRouteTimingDiffs,
  formatSignedDurationDelta,
} from '@/features/plan/routeGroup/domain/routeTimingDiffs'
import { classifyStopTiming } from '@/features/plan/routeGroup/domain/stopTimingClassifier'
import { useActiveRouteGroupResourcesController } from '@/features/plan/routeGroup/controllers/useActiveRouteGroupResources.controller'
import { useTeamMemberByServerId } from '@/features/team/members/hooks/useTeamMemberSelectors'
import { useVehicleStore } from '@/features/infrastructure/vehicle/store/vehicleStore'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'

import type {
  RouteGroupGaussianMetricCard,
  RouteGroupStatsLayoutMode,
  RouteGroupStatsOverlayData,
} from './routeGroupStatsOverlay.types'

const WIDE_LAYOUT_THRESHOLD = 1200
const MEDIUM_LAYOUT_THRESHOLD = 860

const formatDurationLabel = (seconds?: number | null) => {
  if (!Number.isFinite(seconds) || (seconds ?? 0) <= 0) return '0h 0m'
  const totalMinutes = Math.max(0, Math.round((seconds ?? 0) / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

const formatDistanceLabel = (meters?: number | null) => {
  if (!Number.isFinite(meters) || (meters ?? 0) <= 0) return '0 km'
  return `${Math.round((meters ?? 0) / 1000)} km`
}

const toNonNegativeNumber = (value: unknown) => {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length > 0
        ? Number(value)
        : Number.NaN

  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0
}

const normalizeWeightLoadToGrams = (value: unknown) => {
  const numericValue = toNonNegativeNumber(value)
  if (numericValue <= 0) return 0

  return Math.round(numericValue < 10_000 ? numericValue * 1000 : numericValue)
}

const normalizeVolumeLoadToCubicCentimeters = (value: unknown) => {
  const numericValue = toNonNegativeNumber(value)
  return Math.round(numericValue)
}

const formatWeightLabel = (grams?: number | string | null) => {
  const numericGrams = toNonNegativeNumber(grams)
  if (numericGrams <= 0) return '0.0 kg'
  return `${(numericGrams / 1000).toFixed(1)} kg`
}

const formatVolumeLabel = (cubicCentimeters?: number | string | null) => {
  const numericCubicCentimeters = toNonNegativeNumber(cubicCentimeters)
  if (numericCubicCentimeters <= 0) return '0.0 m³'
  return `${(numericCubicCentimeters / 1_000_000).toFixed(1)} m³`
}


const formatDistancePerStopLabel = (meters?: number | null, stopCount?: number | null) => {
  if (!Number.isFinite(meters) || !Number.isFinite(stopCount) || (stopCount ?? 0) <= 0) {
    return '0 km'
  }
  return `${((meters ?? 0) / (stopCount ?? 1) / 1000).toFixed(1)} km`
}

const formatStopsPerHourLabel = (stopCount?: number | null, totalSeconds?: number | null) => {
  if (!Number.isFinite(stopCount) || !Number.isFinite(totalSeconds) || (totalSeconds ?? 0) <= 0) {
    return '0.0'
  }
  const perHour = (stopCount ?? 0) / ((totalSeconds ?? 0) / 3600)
  return perHour.toFixed(1)
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA'

const resolveOperationCounts = (
  routeSolutionStops: Array<{ order_id?: number | null }>,
  ordersById: Map<number, { operation_type?: string | null }>,
) => {
  let pickupCount = 0
  let dropoffCount = 0

  routeSolutionStops.forEach((stop) => {
    if (typeof stop.order_id !== 'number') return
    const operationType = ordersById.get(stop.order_id)?.operation_type
    if (operationType === 'pickup' || operationType === 'pickup_dropoff') pickupCount += 1
    if (operationType === 'dropoff' || operationType === 'pickup_dropoff') dropoffCount += 1
  })

  return { pickupCount, dropoffCount }
}

const resolveRouteLoadTotals = (
  routeSolutionStops: Array<{ order_id?: number | null }>,
  ordersById: Map<number, { total_weight?: number | null; total_volume?: number | null }>,
) => {
  const resolvedOrderIds = new Set<number>()

  return routeSolutionStops.reduce(
    (acc, stop) => {
      if (typeof stop.order_id !== 'number') return acc
      if (resolvedOrderIds.has(stop.order_id)) return acc

      resolvedOrderIds.add(stop.order_id)
      const order = ordersById.get(stop.order_id)
      acc.totalWeightGrams += normalizeWeightLoadToGrams(order?.total_weight)
      acc.totalVolumeCubicCentimeters += normalizeVolumeLoadToCubicCentimeters(order?.total_volume)
      return acc
    },
    { totalWeightGrams: 0, totalVolumeCubicCentimeters: 0 },
  )
}

const resolveCompletionCounts = (
  routeSolutionStops: Array<{ order_id?: number | null }>,
  ordersById: Map<number, { order_state_id?: number | null }>,
  getOrderStateNameById: (id?: number | null) => string | null,
) => routeSolutionStops.reduce(
  (acc, stop) => {
    if (typeof stop.order_id !== 'number') return acc
    const orderStateId = ordersById.get(stop.order_id)?.order_state_id
    const orderStateName = getOrderStateNameById(orderStateId)
    if (orderStateName === 'Completed') acc.completedOrders += 1
    if (orderStateName === 'Fail') acc.failedOrders += 1
    return acc
  },
  { completedOrders: 0, failedOrders: 0 },
)

const resolveTimingCounts = (
  routeSolutionStops: RouteSolutionStop[],
  ordersById: Map<number, Order>,
  etaToleranceSeconds: number,
) => routeSolutionStops.reduce(
  (acc, stop) => {
    if (typeof stop.order_id !== 'number') {
      acc.unclassifiedStops += 1
      return acc
    }

    const order = ordersById.get(stop.order_id)
    const result = classifyStopTiming(stop, order, etaToleranceSeconds)
    if (result.classification === 'on_time') acc.onTimeStops += 1
    if (result.classification === 'late') acc.lateStops += 1
    if (result.classification === 'early') acc.earlyStops += 1
    if (result.classification === 'unclassified') acc.unclassifiedStops += 1
    if (typeof result.arrival_delay_seconds === 'number') acc.arrivalDelaySeconds += result.arrival_delay_seconds
    if (typeof result.arrival_early_seconds === 'number') acc.arrivalEarlySeconds += result.arrival_early_seconds
    return acc
  },
  {
    onTimeStops: 0,
    lateStops: 0,
    earlyStops: 0,
    unclassifiedStops: 0,
    arrivalDelaySeconds: 0,
    arrivalEarlySeconds: 0,
  },
)

const resolveLayoutMode = (width: number): RouteGroupStatsLayoutMode => {
  if (width >= WIDE_LAYOUT_THRESHOLD) return 'wide'
  if (width >= MEDIUM_LAYOUT_THRESHOLD) return 'medium'
  return 'narrow'
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const buildGaussianCards = ({
  totalStops,
  onTimeStops,
  lateStops,
  earlyStops,
  totalWeightGrams,
  totalVolumeCubicCentimeters,
  completedOrders,
  failedOrders,
  vehicleMaxVolumeCm3,
  vehicleMaxWeightG,
}: {
  totalStops: number
  onTimeStops: number
  lateStops: number
  earlyStops: number
  totalWeightGrams: number
  totalVolumeCubicCentimeters: number
  completedOrders: number
  failedOrders: number
  vehicleMaxVolumeCm3?: number | null
  vehicleMaxWeightG?: number | null
}): RouteGroupGaussianMetricCard[] => {
  const seed = totalStops + completedOrders + failedOrders
  const normalizedVehicleMaxVolumeCm3 = toNonNegativeNumber(vehicleMaxVolumeCm3)
  const normalizedVehicleMaxWeightG = toNonNegativeNumber(vehicleMaxWeightG)
  const hasVehicleVolumeLimit = normalizedVehicleMaxVolumeCm3 > 0
  const hasVehicleWeightLimit = normalizedVehicleMaxWeightG > 0
  const volumeRatio = hasVehicleVolumeLimit
    ? clampPercent((totalVolumeCubicCentimeters / normalizedVehicleMaxVolumeCm3) * 100)
    : 0
  const weightRatio = hasVehicleWeightLimit
    ? clampPercent((totalWeightGrams / normalizedVehicleMaxWeightG) * 100)
    : 0

  return [
    {
      id: 'timing',
      faces: [
        {
          id: 'on-time',
          label: 'On time stops',
          displayValue: `${onTimeStops}`,
          progressValue: clampPercent(totalStops === 0 ? 0 : (onTimeStops / totalStops) * 100),
          accentClassName: 'stroke-emerald-400',
          animation: {
            numericValue: onTimeStops,
            valueType: 'integer',
            sourceType: 'realtime',
            compareMode: 'strict',
          },
        },
        {
          id: 'late',
          label: 'Late stops',
          displayValue: `${lateStops}`,
          progressValue: clampPercent(totalStops === 0 ? 0 : (lateStops / totalStops) * 100),
          accentClassName: 'stroke-amber-400',
          animation: {
            numericValue: lateStops,
            valueType: 'integer',
            sourceType: 'realtime',
            compareMode: 'strict',
          },
        },
        {
          id: 'early',
          label: 'Early stops',
          displayValue: `${earlyStops}`,
          progressValue: clampPercent(totalStops === 0 ? 0 : (earlyStops / totalStops) * 100),
          accentClassName: 'stroke-sky-400',
          animation: {
            numericValue: earlyStops,
            valueType: 'integer',
            sourceType: 'realtime',
            compareMode: 'strict',
          },
        },
      ],
    },
    {
      id: 'capacity',
      faces: [
        {
          id: 'volume',
          label: 'Route capacity volume',
          displayValue: formatVolumeLabel(totalVolumeCubicCentimeters),
          subDisplayValue: hasVehicleVolumeLimit ? `/ ${formatVolumeLabel(normalizedVehicleMaxVolumeCm3)}` : null,
          progressValue: volumeRatio,
          useCapacityColor: true,
          animation: {
            numericValue: volumeRatio,
            valueType: 'percent',
            sourceType: hasVehicleVolumeLimit ? 'derived' : 'estimated',
            compareMode: 'threshold',
            threshold: 1,
          },
        },
        {
          id: 'weight',
          label: 'Route weight',
          displayValue: formatWeightLabel(totalWeightGrams),
          subDisplayValue: hasVehicleWeightLimit ? `/ ${formatWeightLabel(normalizedVehicleMaxWeightG)}` : null,
          progressValue: weightRatio,
          useCapacityColor: true,
          animation: {
            numericValue: weightRatio,
            valueType: 'percent',
            sourceType: hasVehicleWeightLimit ? 'derived' : 'estimated',
            compareMode: 'threshold',
            threshold: 1,
          },
        },
      ],
    },
    {
      id: 'completion',
      faces: [
        {
          id: 'completed-orders',
          label: 'Orders completed',
          displayValue: `${completedOrders}`,
          progressValue: clampPercent(totalStops === 0 ? 0 : (completedOrders / totalStops) * 100),
          accentClassName: 'stroke-lime-400',
          animation: {
            numericValue: completedOrders,
            valueType: 'integer',
            sourceType: 'derived',
            compareMode: 'strict',
          },
        },
        {
          id: 'failed-orders',
          label: 'Orders fail',
          displayValue: `${failedOrders}`,
          progressValue: clampPercent(totalStops === 0 ? 0 : (failedOrders / totalStops) * 100),
          accentClassName: 'stroke-rose-400',
          animation: {
            numericValue: failedOrders,
            valueType: 'integer',
            sourceType: 'derived',
            compareMode: 'strict',
          },
        },
      ],
    },
  ]
}

const buildStatsData = ({
  routeId,
  routeClientId,
  distanceMeters,
  travelTimeSeconds,
  serviceTimeSeconds,
  totalDurationDelta,
  drivingDurationDelta,
  serviceDurationDelta,
  pickupCount,
  dropoffCount,
  totalStops,
  driverName,
  totalWeightGrams,
  totalVolumeCubicCentimeters,
  onTimeStops,
  lateStops,
  earlyStops,
  unclassifiedStops,
  arrivalDelaySeconds,
  arrivalEarlySeconds,
  completedOrders,
  failedOrders,
  vehicleMaxVolumeCm3,
  vehicleMaxWeightG,
  vehicleCostPerKm,
  vehicleFuelType,
  vehicleRegistrationNumber,
}: {
  routeId: number | null
  routeClientId?: string | null
  distanceMeters?: number | null
  travelTimeSeconds?: number | null
  serviceTimeSeconds?: number | null
  totalDurationDelta: string | null
  drivingDurationDelta: string | null
  serviceDurationDelta: string | null
  pickupCount: number
  dropoffCount: number
  totalStops: number
  driverName: string
  totalWeightGrams: number
  totalVolumeCubicCentimeters: number
  onTimeStops: number
  lateStops: number
  earlyStops: number
  unclassifiedStops: number
  arrivalDelaySeconds: number
  arrivalEarlySeconds: number
  completedOrders: number
  failedOrders: number
  vehicleMaxVolumeCm3?: number | null
  vehicleMaxWeightG?: number | null
  vehicleCostPerKm?: number | null
  vehicleFuelType?: string | null
  vehicleRegistrationNumber?: string | null
}): RouteGroupStatsOverlayData => {
  const distanceKm = Math.max(0, (distanceMeters ?? 0) / 1000)
  const roundedDistanceKm = Math.round(distanceKm)
  const avgDistanceKm = totalStops > 0 ? distanceKm / Math.max(1, totalStops) : 0
  const drivingSeconds = travelTimeSeconds ?? 0
  const serviceSeconds = serviceTimeSeconds ?? 0
  const totalSeconds = drivingSeconds + serviceSeconds

  const CO2_FACTORS: Record<string, number> = {
    bensine: 0.21,
    diesel: 0.19,
    electric: 0.05,
  }
  const fuelCost = vehicleCostPerKm != null ? distanceKm * vehicleCostPerKm : null
  const co2Factor = vehicleFuelType != null ? (CO2_FACTORS[vehicleFuelType] ?? null) : null
  const co2Value = co2Factor != null ? distanceKm * co2Factor : null

  return {
    routeScopeKey: routeClientId || `route-${routeId ?? 'unknown'}`,
    routeSummary: {
      rows: [
        [
          {
            id: 'distance-total',
            label: 'total distance',
            value: formatDistanceLabel(distanceMeters),
            animation: {
              numericValue: roundedDistanceKm,
              valueType: 'integer',
              unitSuffix: 'km',
              sourceType: 'realtime',
              compareMode: 'strict',
            },
          },
          {
            id: 'distance-avg-stop',
            label: 'distance / stop',
            value: formatDistancePerStopLabel(distanceMeters, totalStops),
            animation: {
              numericValue: avgDistanceKm,
              valueType: 'decimal',
              unitSuffix: 'km',
              sourceType: 'derived',
              compareMode: 'epsilon',
              epsilon: 0.1,
              decimals: 1,
            },
          },
          { id: 'distance-empty', label: '', value: '' },
        ],
        [
          {
            id: 'duration-total',
            label: 'total duration',
            value: formatDurationLabel(totalSeconds),
            delta: totalDurationDelta,
            animation: {
              numericValue: totalSeconds,
              valueType: 'duration_seconds',
              sourceType: 'realtime',
              compareMode: 'threshold',
              threshold: 30,
            },
          },
          {
            id: 'duration-driving',
            label: 'driving duration',
            value: formatDurationLabel(drivingSeconds),
            delta: drivingDurationDelta,
            animation: {
              numericValue: drivingSeconds,
              valueType: 'duration_seconds',
              sourceType: 'realtime',
              compareMode: 'threshold',
              threshold: 30,
            },
          },
          {
            id: 'duration-service',
            label: 'service duration',
            value: formatDurationLabel(serviceSeconds),
            delta: serviceDurationDelta,
            animation: {
              numericValue: serviceSeconds,
              valueType: 'duration_seconds',
              sourceType: 'derived',
              compareMode: 'threshold',
              threshold: 30,
            },
          },
        ],
        [
          {
            id: 'stops-total',
            label: 'total stops',
            value: `${totalStops}`,
            animation: {
              numericValue: totalStops,
              valueType: 'integer',
              sourceType: 'realtime',
              compareMode: 'strict',
            },
          },
          {
            id: 'stops-dropoffs',
            label: 'dropoffs',
            value: `${dropoffCount}`,
            animation: {
              numericValue: dropoffCount,
              valueType: 'integer',
              sourceType: 'derived',
              compareMode: 'strict',
            },
          },
          {
            id: 'stops-pickups',
            label: 'pickups',
            value: `${pickupCount}`,
            animation: {
              numericValue: pickupCount,
              valueType: 'integer',
              sourceType: 'derived',
              compareMode: 'strict',
            },
          },
        ],
      ],
    },
    driver: {
      initials: getInitials(driverName),
      name: driverName,
      registration: vehicleRegistrationNumber ?? null,
    },
    gaussianCards: buildGaussianCards({
      totalStops,
      onTimeStops,
      lateStops,
      earlyStops,
      totalWeightGrams,
      totalVolumeCubicCentimeters,
      completedOrders,
      failedOrders,
      vehicleMaxVolumeCm3,
      vehicleMaxWeightG,
    }),
    consumptionMetrics: [
      {
        id: 'stops-per-hour',
        label: 'Stops / hour',
        displayValue: formatStopsPerHourLabel(totalStops, totalSeconds),
        animation: {
          numericValue: totalSeconds > 0 ? totalStops / (totalSeconds / 3600) : 0,
          valueType: 'decimal',
          sourceType: 'derived',
          compareMode: 'epsilon',
          epsilon: 0.1,
          decimals: 1,
        },
      },
      ...(fuelCost != null
        ? [
            {
              id: 'fuel-cost',
              label: 'Fuel cost',
              displayValue: `${fuelCost.toFixed(1)} €`,
              popover: {
                title: 'Fuel Cost',
                rows: [
                  { label: 'Distance', value: `${distanceKm.toFixed(1)} km` },
                  { label: 'Rate', value: `€${vehicleCostPerKm!.toFixed(2)} / km` },
                  { label: 'Total cost', value: `€${fuelCost.toFixed(1)}`, isResult: true },
                ],
              },
              animation: {
                numericValue: fuelCost,
                valueType: 'currency' as const,
                unitSuffix: '€',
                sourceType: 'derived' as const,
                compareMode: 'epsilon' as const,
                epsilon: 0.1,
                decimals: 1,
              },
            },
          ]
        : [
            {
              id: 'fuel-cost',
              label: 'Fuel cost',
              displayValue: '—',
              animation: {
                numericValue: 0,
                valueType: 'currency' as const,
                unitSuffix: '€',
                sourceType: 'estimated' as const,
                compareMode: 'epsilon' as const,
                epsilon: 0.1,
                decimals: 1,
              },
            },
          ]),
      ...(co2Value != null
        ? [
            {
              id: 'co2',
              label: 'Co2',
              displayValue: `${co2Value.toFixed(1)} kg`,
              popover: {
                title: 'CO₂ Emission',
                rows: [
                  { label: 'Distance', value: `${distanceKm.toFixed(1)} km` },
                  { label: `Factor (${vehicleFuelType ?? ''})`, value: `${co2Factor!.toFixed(2)} kg / km` },
                  { label: 'Total CO₂', value: `${co2Value.toFixed(1)} kg`, isResult: true },
                ],
              },
              animation: {
                numericValue: co2Value,
                valueType: 'decimal' as const,
                unitSuffix: 'kg',
                sourceType: 'derived' as const,
                compareMode: 'epsilon' as const,
                epsilon: 0.1,
                decimals: 1,
              },
            },
          ]
        : [
            {
              id: 'co2',
              label: 'Co2',
              displayValue: '—',
              animation: {
                numericValue: 0,
                valueType: 'decimal' as const,
                unitSuffix: 'kg',
                sourceType: 'estimated' as const,
                compareMode: 'epsilon' as const,
                epsilon: 0.1,
                decimals: 1,
              },
            },
          ]),
    ],
    timingAnalytics: {
      unclassifiedStopCount: unclassifiedStops,
      arrivalDelaySeconds,
      arrivalEarlySeconds,
    },
  }
}

export const useRouteGroupStatsOverlayController = () => {
  const baseControlls = useBaseControlls<PayloadBase>()
  const planId = baseControlls.payload?.planId ?? null
  const {
    selectedRouteSolution,
    routeSolutionStops,
    orders,
  } = useActiveRouteGroupResourcesController(planId)
  const orderStateRegistry = useOrderStateRegistry()
  const driver = useTeamMemberByServerId(selectedRouteSolution?.driver_id ?? null)
  const vehicleIds = useVehicleStore((state) => state.allIds)
  const vehicleByClientId = useVehicleStore((state) => state.byClientId)
  const [hidden, setHidden] = useState(false)
  const [layoutMode, setLayoutMode] = useState<RouteGroupStatsLayoutMode>('wide')
  const overlayRef = useRef<HTMLDivElement | null>(null)

  const vehicle = useMemo(() => {
    const vehicleId = selectedRouteSolution?.vehicle_id
    if (vehicleId == null) return null
    const normalizedVehicleId = String(vehicleId)

    return vehicleIds
      .map((clientId) => vehicleByClientId[clientId])
      .find((candidate) => {
        if (!candidate) return false
        return (
          String(candidate.id ?? '') === normalizedVehicleId
          || candidate.client_id === normalizedVehicleId
        )
      }) ?? null
  }, [selectedRouteSolution?.vehicle_id, vehicleByClientId, vehicleIds])

  const ordersById = useMemo(
    () =>
      orders.reduce<Map<number, (typeof orders)[number]>>((acc, order) => {
        if (typeof order.id === 'number') {
          acc.set(order.id, order)
        }
        return acc
      }, new Map()),
    [orders],
  )

  useEffect(() => {
    setHidden(false)
  }, [selectedRouteSolution?.client_id])

  useEffect(() => {
    const element = overlayRef.current
    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const updateLayoutMode = () => {
      setLayoutMode(resolveLayoutMode(element.clientWidth))
    }

    const observer = new ResizeObserver(updateLayoutMode)
    observer.observe(element)
    updateLayoutMode()

    return () => observer.disconnect()
  }, [])

  const statsData = useMemo(() => {
    if (!selectedRouteSolution) return null
    const routeTimingDiffs = computeRouteTimingDiffs({
      routeSolution: selectedRouteSolution,
      stops: routeSolutionStops,
    })

    const { pickupCount, dropoffCount } = resolveOperationCounts(routeSolutionStops, ordersById)
    const { totalWeightGrams, totalVolumeCubicCentimeters } = resolveRouteLoadTotals(routeSolutionStops, ordersById)
    const { completedOrders, failedOrders } = resolveCompletionCounts(
      routeSolutionStops,
      ordersById,
      (orderStateId) => orderStateRegistry.getById(orderStateId ?? -1)?.name ?? null,
    )
    const {
      onTimeStops,
      lateStops,
      earlyStops,
      unclassifiedStops,
      arrivalDelaySeconds,
      arrivalEarlySeconds,
    } = resolveTimingCounts(
      routeSolutionStops,
      ordersById,
      selectedRouteSolution.eta_tolerance_seconds ?? 0,
    )
    const driverName = driver?.username ?? driver?.email?.split('@')[0] ?? 'Unassigned'
    const serviceTimeSeconds = routeTimingDiffs.expectedServiceSeconds
    const totalStops = routeSolutionStops.length || selectedRouteSolution.stop_count || 0

    return buildStatsData({
      routeId: selectedRouteSolution.id ?? null,
      routeClientId: selectedRouteSolution.client_id,
      distanceMeters: selectedRouteSolution.total_distance_meters,
      travelTimeSeconds: selectedRouteSolution.total_travel_time_seconds,
      serviceTimeSeconds,
      totalDurationDelta: formatSignedDurationDelta(routeTimingDiffs.totalDiffSeconds),
      drivingDurationDelta: formatSignedDurationDelta(routeTimingDiffs.drivingDiffSeconds),
      serviceDurationDelta: formatSignedDurationDelta(routeTimingDiffs.serviceDiffSeconds),
      pickupCount,
      dropoffCount,
      totalStops,
      driverName,
      totalWeightGrams,
      totalVolumeCubicCentimeters,
      onTimeStops,
      lateStops,
      earlyStops,
      unclassifiedStops,
      arrivalDelaySeconds,
      arrivalEarlySeconds,
      completedOrders,
      failedOrders,
      vehicleMaxVolumeCm3: vehicle?.max_volume_load_cm3 ?? null,
      vehicleMaxWeightG: vehicle?.max_weight_load_g ?? null,
      vehicleCostPerKm: vehicle?.cost_per_km ?? null,
      vehicleFuelType: vehicle?.fuel_type ?? null,
      vehicleRegistrationNumber: vehicle?.registration_number ?? null,
    })
  }, [
    driver?.email,
    driver?.username,
    orderStateRegistry,
    ordersById,
    routeSolutionStops,
    selectedRouteSolution,
    vehicle?.cost_per_km,
    vehicle?.fuel_type,
    vehicle?.max_volume_load_cm3,
    vehicle?.max_weight_load_g,
    vehicle?.registration_number,
  ])

  return {
    hidden,
    layoutMode,
    overlayRef,
    statsData,
    hide: () => setHidden(true),
    show: () => setHidden(false),
  }
}
