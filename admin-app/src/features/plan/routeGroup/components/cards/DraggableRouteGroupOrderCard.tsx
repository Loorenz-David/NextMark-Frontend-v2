import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

import { RouteGroupOrderCard } from './RouteGroupOrderCard'

type DraggableRouteGroupOrderCardProps = {
  order: Order
  stop: RouteSolutionStop
  displayStopOrder?: number | null
  planStartDate?: string | null
  routeGroupId?: number | null
  allOrderedStopClientIds: string[]
}


export const DraggableRouteGroupOrderCard = ({
  order,
  stop,
  displayStopOrder,
  planStartDate,
  routeGroupId,
  allOrderedStopClientIds,
}: DraggableRouteGroupOrderCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stop.client_id,
    data: {
      type: 'route_stop',
      id:stop.client_id,
      order,
      stop,
      planStartDate,
      routeStopId: stop.id,
      routeStopClientId: stop.client_id,
      routeSolutionId: stop.route_solution_id,
      allOrderedStopClientIds,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RouteGroupOrderCard
        order={order}
        stop={stop}
        displayStopOrder={displayStopOrder}
        planStartDate={planStartDate}
        routeGroupId={routeGroupId}
      />
    </div>
  )
}
