import type { PlanQueryFilters } from '@/features/plan/types/planMeta'

export type PlanDateFilterMode = 'month' | 'date' | 'range'

export type PlanDateFilterSelection = {
  mode: PlanDateFilterMode
  singleDate: Date
  rangeStart: Date
  rangeEnd: Date
}

export type PlanDateFilterPayload = {
  selection: PlanDateFilterSelection
  filters: PlanQueryFilters
}

export type PlanDateFilterControllerParams = {
  onFiltersChange?: (filters: PlanQueryFilters) => void
  onSelectionChange?: (payload: PlanDateFilterPayload) => void
  initialMode?: PlanDateFilterMode
}
