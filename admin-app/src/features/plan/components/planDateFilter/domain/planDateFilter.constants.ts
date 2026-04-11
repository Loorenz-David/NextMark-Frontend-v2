import type { PlanDateFilterMode } from './planDateFilter.types'

export const PLAN_DATE_FILTER_MODES: Array<{ label: string; value: PlanDateFilterMode }> = [
  { label: 'Month', value: 'month' },
  { label: 'Date', value: 'date' },
  { label: 'Range', value: 'range' },
]

export const PLAN_DATE_FILTER_DEFAULT_MODE: PlanDateFilterMode = 'month'
