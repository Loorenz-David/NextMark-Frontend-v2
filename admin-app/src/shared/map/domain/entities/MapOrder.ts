import type { Coordinates } from '../types'

export type MapOrderStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | string
export type MapOrderInteractionVariant = 'default' | 'order'
export type MapMarkerOperationDirection = 'up' | 'down'

export type MapOrder = {
  id: string
  coordinates: Coordinates 
  route_plan_id?: number | null
  markerColor?: string
  status?: MapOrderStatus
  sequence?: number | null
  label?: string 
  onClick: (e:MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  hoverIds?: string[]
  onHoverIdsEnter?: (e: MouseEvent, ids: string[]) => void
  onHoverIdsLeave?: (e: MouseEvent, ids: string[]) => void
  className?: string
  interactionVariant?: MapOrderInteractionVariant
  operationBadgeDirections?: MapMarkerOperationDirection[]
}
