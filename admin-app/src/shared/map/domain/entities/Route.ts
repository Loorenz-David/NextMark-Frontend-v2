import type { RouteProgressSegment } from '@shared-domain'

export type Route = {
  segments: RouteProgressSegment[]
  fitBounds?: boolean
}
