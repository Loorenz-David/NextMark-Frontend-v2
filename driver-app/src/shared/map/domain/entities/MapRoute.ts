import type {
  RouteProgressSegment,
  RouteProgressSegmentState,
} from '@shared-domain'

export type MapRouteSegmentState = RouteProgressSegmentState
export type MapRouteSegment = RouteProgressSegment

export type MapRoute = {
  segments: MapRouteSegment[]
}
