import { useState } from "react";

import { ChevronDownIcon } from "@/assets/icons";
import { cn } from "@/lib/utils/cn";
import { MemberAvatar } from "@/shared/layout/MemberAvatar";

import type { RouteGroupDriverOverlayStats } from "./routeGroupStatsOverlay.types";

type RouteGroupDriverCardProps = {
  driver: RouteGroupDriverOverlayStats;
};

export const RouteGroupDriverCard = ({ driver }: RouteGroupDriverCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pointer-events-none relative">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="admin-backdrop-blur-md pointer-events-auto relative flex min-w-[180px] flex-col rounded-[24px] border border-white/20 bg-black/28 px-4 py-4 text-sm text-white transition-colors hover:bg-black/38"
      >
        <div className="flex items-center justify-end gap-3 ">
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-semibold text-white">
              {driver.name}
            </div>
            {driver.registration != null && (
              <div className="mt-1 text-sm font-medium text-white/82">
                {driver.registration}
              </div>
            )}
          </div>
          <MemberAvatar
            username={driver.initials}
            className="h-12 w-12 shrink-0 bg-white/12 p-0 text-lg text-white"
          />
        </div>
        <ChevronDownIcon
          className={cn(
            "absolute left-3 top-3 h-4 w-4 text-white/72 transition-transform",
            expanded ? "rotate-90" : "rotate-0",
          )}
        />
      </button>

      {expanded ? (
        <div className="admin-backdrop-blur-md pointer-events-auto absolute right-full top-0 mr-3 min-w-[220px] rounded-[24px] border border-white/45 bg-black/28 px-4 py-4 text-left text-xs text-white/72">
          Driver stats will be added here.
        </div>
      ) : null}
    </div>
  );
};
