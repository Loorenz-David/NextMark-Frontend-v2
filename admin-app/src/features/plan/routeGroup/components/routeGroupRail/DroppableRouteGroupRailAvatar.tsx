import { useDroppable } from "@dnd-kit/core";

import { useDroppableRouteGroupTargetHighlight } from "@/features/plan/dnd/controllers/useDroppableTargetHighlight.controller";

import { RouteGroupRailAvatar } from "./RouteGroupRailAvatar";
import type { RouteGroupRailItem } from "./types";

type Props = {
  item: RouteGroupRailItem;
  onClick: (item: RouteGroupRailItem) => void;
};

export const DroppableRouteGroupRailAvatar = ({ item, onClick }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `route_group_rail-${item.route_group_id}`,
    data: {
      type: "route_group_rail",
      routeGroupId: item.route_group_id,
    },
  });
  const shouldHighlightDropTarget = useDroppableRouteGroupTargetHighlight({
    isOver,
    targetRouteGroupId: item.route_group_id,
  });

  return (
    <div ref={setNodeRef}>
      <RouteGroupRailAvatar
        item={item}
        onClick={onClick}
        isDropTarget={shouldHighlightDropTarget}
      />
    </div>
  );
};
