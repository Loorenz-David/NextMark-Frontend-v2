import type { DriverStopRowNoteDisplay } from './mapStopRowOrderNote'

export type AssignedRouteSummaryDisplay = {
  routeTitle: string
  finishTimeLabel: string | null
  stopCountLabel: string
  distanceLabel: string | null
}

export type AssignedRouteTerminalDisplay = {
  timeLabel: string | null
  title: string
  addressLine: string | null
}

export type AssignedRouteStopRowDisplay = {
  stopClientId: string
  stopIndexLabel: string | null
  timeLabel: string | null
  title: string
  addressLine: string | null
  durationLabel: string | null
  itemSummary: string | null
  itemCountLabel: string | null
  phoneLine: string | null
  orderNotes: DriverStopRowNoteDisplay[]
  badgeLabel: string | null
  isActive: boolean
  isCompleted: boolean
}

export type AssignedRoutePageDisplay = {
  state: 'loading' | 'empty' | 'ready'
  emptyMessage?: string
  summary: AssignedRouteSummaryDisplay | null
  timeline: {
    start: AssignedRouteTerminalDisplay
    stops: AssignedRouteStopRowDisplay[]
    end: AssignedRouteTerminalDisplay
  } | null
  footerLabel: string
}
