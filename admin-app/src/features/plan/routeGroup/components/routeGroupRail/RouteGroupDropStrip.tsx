import { useDndContext } from "@dnd-kit/core";

import { isOrderDragActive } from "@/features/plan/domain/orderDragActivity";

import { DroppableRouteGroupRailAvatar } from "./DroppableRouteGroupRailAvatar";
import type { RouteGroupRailItem } from "./types";

type RouteGroupDropStripProps = {
  items: RouteGroupRailItem[];
};

/**
 * The other zones as drop targets while orders or stops are dragged. Zones
 * are picked from the header menu now, so the rail's drop targets only
 * appear for the length of a drag, laid over the top of the list so the
 * stops underneath do not shift mid-drag.
 */
export const RouteGroupDropStrip = ({ items }: RouteGroupDropStripProps) => {
  const { active } = useDndContext();
  const targets = items.filter((item) => !item.isActive);

  if (!isOrderDragActive(active?.data.current) || targets.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 top-0 z-30 border-b border-border bg-[var(--surface-page-header)] shadow-[var(--shadow-panel-section)]">
      <p className="px-4 pt-2 text-2xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Move to zone
      </p>
      <div className="scroll-thin flex gap-1 overflow-x-auto px-2 pb-1">
        {targets.map((item) => (
          <div key={item.route_group_id} className="w-[84px] shrink-0">
            <DroppableRouteGroupRailAvatar item={item} onClick={() => undefined} />
          </div>
        ))}
      </div>
    </div>
  );
};
