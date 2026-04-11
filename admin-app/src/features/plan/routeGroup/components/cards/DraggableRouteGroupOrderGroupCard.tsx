import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { RouteGroupAddressGroup } from '@/features/plan/routeGroup/domain/routeGroupAddressGroup.flow'
import { RouteGroupOrderGroupCard } from './RouteGroupOrderGroupCard'

type DraggableRouteGroupOrderGroupCardProps = {
  group: RouteGroupAddressGroup
  expanded: boolean
  onToggleExpanded: () => void
  planStartDate?: string | null
  routeGroupId?: number | null
  projectedStopOrderByClientId?: Map<string, number> | null
  allOrderedStopClientIds: string[]
}

export const DraggableRouteGroupOrderGroupCard = ({
  group,
  expanded,
  onToggleExpanded,
  planStartDate,
  routeGroupId,
  projectedStopOrderByClientId,
  allOrderedStopClientIds,
}: DraggableRouteGroupOrderGroupCardProps) => {
  const rowId = `route_stop_group:${group.key}`

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowId,
    data: {
      type: 'route_stop_group',
      id: rowId,
      groupKey: group.key,
      label: group.label,
      orderIds: group.orderIds,
      orderCount: group.entries.length,
      routeStopIds: group.routeStopIds,
      routeStopClientIds: group.routeStopClientIds,
      routeSolutionId: group.routeSolutionId,
      firstAnchorStopId: group.firstAnchorStopId,
      firstAnchorStopClientId: group.firstAnchorStopClientId,
      lastAnchorStopId: group.lastAnchorStopId,
      lastAnchorStopClientId: group.lastAnchorStopClientId,
      anchorStopId: group.anchorStopId,
      anchorStopClientId: group.anchorStopClientId,
      allOrderedStopClientIds,
      firstStopOrder: group.firstStopOrder,
      lastStopOrder: group.lastStopOrder,
      minEta: group.minEta,
      maxEta: group.maxEta,
      order: group.entries[0]?.order,
      stop: group.entries[0]?.stop,
      planStartDate,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <RouteGroupOrderGroupCard
        group={group}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
        planStartDate={planStartDate}
        routeGroupId={routeGroupId}
        projectedStopOrderByClientId={projectedStopOrderByClientId}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}
