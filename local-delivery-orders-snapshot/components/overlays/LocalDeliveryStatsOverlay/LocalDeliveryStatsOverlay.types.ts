export type LocalDeliveryDriverOverlayStats = {
  initials: string
  name: string
  registration: string | null
}

export type LocalDeliverySummaryMetric = {
  id: string
  label: string
  value: string
  delta?: string | null
  animation?: LocalDeliveryAnimatedMetric | null
}

export type LocalDeliveryMetricSourceType = 'realtime' | 'derived' | 'estimated'

export type LocalDeliveryAnimatedValueType =
  | 'integer'
  | 'decimal'
  | 'duration_seconds'
  | 'percent'
  | 'currency'

export type LocalDeliveryAnimatedMetric = {
  numericValue: number
  valueType: LocalDeliveryAnimatedValueType
  unitSuffix?: string
  sourceType: LocalDeliveryMetricSourceType
  compareMode?: 'strict' | 'epsilon' | 'threshold'
  epsilon?: number
  threshold?: number
  decimals?: number
}

export type LocalDeliveryRouteSummaryStats = {
  rows: [
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
    [LocalDeliverySummaryMetric, LocalDeliverySummaryMetric, LocalDeliverySummaryMetric],
  ]
}

export type LocalDeliveryGaussianMetricFace = {
  id: string
  label: string
  displayValue: string
  progressValue: number
  accentClassName?: string
  animation?: LocalDeliveryAnimatedMetric | null
}

export type LocalDeliveryGaussianMetricCard = {
  id: string
  faces: LocalDeliveryGaussianMetricFace[]
}

export type LocalDeliveryConsumptionMetric = {
  id: string
  label: string
  displayValue: string
  animation: LocalDeliveryAnimatedMetric
}

export type LocalDeliveryTimingAnalytics = {
  unclassifiedStopCount: number
  arrivalDelaySeconds: number
  arrivalEarlySeconds: number
}

export type LocalDeliveryStatsOverlayData = {
  routeScopeKey: string
  routeSummary: LocalDeliveryRouteSummaryStats
  driver: LocalDeliveryDriverOverlayStats
  gaussianCards: LocalDeliveryGaussianMetricCard[]
  consumptionMetrics: LocalDeliveryConsumptionMetric[]
  timingAnalytics: LocalDeliveryTimingAnalytics
}

export type LocalDeliveryStatsLayoutMode = 'wide' | 'medium' | 'narrow'
