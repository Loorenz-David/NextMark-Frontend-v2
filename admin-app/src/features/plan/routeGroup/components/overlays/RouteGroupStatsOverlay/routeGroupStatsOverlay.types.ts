export type RouteGroupDriverOverlayStats = {
  initials: string
  name: string
  registration: string | null
}

export type RouteGroupSummaryMetric = {
  id: string
  label: string
  value: string
  delta?: string | null
  animation?: RouteGroupAnimatedMetric | null
}

export type RouteGroupMetricSourceType = 'realtime' | 'derived' | 'estimated'

export type RouteGroupAnimatedValueType =
  | 'integer'
  | 'decimal'
  | 'duration_seconds'
  | 'percent'
  | 'currency'

export type RouteGroupAnimatedMetric = {
  numericValue: number
  valueType: RouteGroupAnimatedValueType
  unitSuffix?: string
  sourceType: RouteGroupMetricSourceType
  compareMode?: 'strict' | 'epsilon' | 'threshold'
  epsilon?: number
  threshold?: number
  decimals?: number
}

export type RouteGroupRouteSummaryStats = {
  rows: [
    [RouteGroupSummaryMetric, RouteGroupSummaryMetric, RouteGroupSummaryMetric],
    [RouteGroupSummaryMetric, RouteGroupSummaryMetric, RouteGroupSummaryMetric],
    [RouteGroupSummaryMetric, RouteGroupSummaryMetric, RouteGroupSummaryMetric],
  ]
}

export type RouteGroupGaussianMetricFace = {
  id: string
  label: string
  displayValue: string
  progressValue: number
  accentClassName?: string
  animation?: RouteGroupAnimatedMetric | null
}

export type RouteGroupGaussianMetricCard = {
  id: string
  faces: RouteGroupGaussianMetricFace[]
}

export type RouteGroupConsumptionMetric = {
  id: string
  label: string
  displayValue: string
  animation: RouteGroupAnimatedMetric
}

export type RouteGroupTimingAnalytics = {
  unclassifiedStopCount: number
  arrivalDelaySeconds: number
  arrivalEarlySeconds: number
}

export type RouteGroupStatsOverlayData = {
  routeScopeKey: string
  routeSummary: RouteGroupRouteSummaryStats
  driver: RouteGroupDriverOverlayStats
  gaussianCards: RouteGroupGaussianMetricCard[]
  consumptionMetrics: RouteGroupConsumptionMetric[]
  timingAnalytics: RouteGroupTimingAnalytics
}

export type RouteGroupStatsLayoutMode = 'wide' | 'medium' | 'narrow'
