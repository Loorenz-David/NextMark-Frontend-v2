import { PlusIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";

import { DroppableRouteGroupRailAvatar } from "./DroppableRouteGroupRailAvatar";
import type { RouteGroupRailItem } from "./types";

type RouteGroupRailProps = {
  items: RouteGroupRailItem[];
  onClick: (item: RouteGroupRailItem) => void;
  onCreate: () => void;
};

export const RouteGroupRail = ({
  items,
  onClick,
  onCreate,
}: RouteGroupRailProps) => {
  return (
    <aside className="min-h-0 h-full w-full md:w-[100px] md:min-w-[100px] md:max-w-[100px]">
      <div className="flex min-h-0 h-full flex-row gap-2 overflow-x-auto px-3 py-3 md:flex-col md:overflow-x-visible md:overflow-y-auto md:px-2">
        <BasicButton
          params={{
            variant: "ghost",
            className:
              "flex min-w-[78px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-3 md:w-full",
            onClick: onCreate,
            ariaLabel: "Create route group",
          }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-white/[0.03]">
            <PlusIcon className="h-4 w-4 stroke-[var(--color-light-blue)]" />
          </span>
          <span className="text-[10px] font-medium text-[var(--color-text)]">
            New Group
          </span>
        </BasicButton>
        {items.map((item) => (
          <DroppableRouteGroupRailAvatar
            key={item.route_group_id}
            item={item}
            onClick={onClick}
          />
        ))}
      </div>
    </aside>
  );
};
