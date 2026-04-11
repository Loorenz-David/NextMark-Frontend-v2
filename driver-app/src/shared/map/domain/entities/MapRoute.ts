export type MapRouteSegmentState = 'completed' | 'pending'

export type MapRouteSegment = {
  path: string
  state: MapRouteSegmentState
}

export type MapRoute = {
  segments: MapRouteSegment[]
}
