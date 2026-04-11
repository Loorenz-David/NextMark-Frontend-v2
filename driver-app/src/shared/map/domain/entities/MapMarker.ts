import type { Coordinates } from '../types'

export type MapMarkerStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | string
export type MapMarkerInteractionVariant =
  | 'default'
  | 'stop'
  | 'current-location'
  | 'route-start'
  | 'route-end'

export type MapMarkerIconName = 'home-start' | 'finish'

export type MapMarker = {
  id: string
  coordinates: Coordinates
  markerColor?: string
  status?: MapMarkerStatus
  sequence?: number | null
  label?: string
  onClick?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  className?: string
  interactionVariant?: MapMarkerInteractionVariant
  iconName?: MapMarkerIconName
}
