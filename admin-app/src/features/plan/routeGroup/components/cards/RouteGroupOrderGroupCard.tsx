import { useState } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";

import { BoldArrowIcon, TriangleWarningIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";
import { formatRouteTime } from "@/features/plan/routeGroup/utils/formatRouteTime";
import type { RouteGroupAddressGroup } from "@/features/plan/routeGroup/domain/routeGroupAddressGroup.flow";
import { RouteGroupOrderGroupChildren } from "./RouteGroupOrderGroupChildren";
import { StopOrderAvatar } from "./StopOrderAvatar";

type RouteGroupOrderGroupCardProps = {
  group: RouteGroupAddressGroup;
  expanded: boolean;
  onToggleExpanded: () => void;
  planStartDate?: string | null;
  routeGroupId?: number | null;
  projectedStopOrderByClientId?: Map<string, number> | null;
  dragAttributes?: DraggableAttributes;
  dragListeners?: any;
};

const formatRange = (
  minEta: string | null,
  maxEta: string | null,
  planStartDate?: string | null,
): string => {
  if (!minEta && !maxEta) return "--";
  const left = minEta ? formatRouteTime(minEta, planStartDate) : "--";
  const right = maxEta ? formatRouteTime(maxEta, planStartDate) : "--";
  return `${left} - ${right}`;
};

export const RouteGroupOrderGroupCard = ({
  group,
  expanded,
  onToggleExpanded,
  planStartDate,
  routeGroupId,
  projectedStopOrderByClientId,
  dragAttributes,
  dragListeners,
}: RouteGroupOrderGroupCardProps) => {
  const [warningOpen, setWarningOpen] = useState(false);

  return (
    <div className="flex flex-col border-y border-dashed  border-y-[var(--color-muted)]/80 my-4">
      <div className=" py-4 pr-4 pl-3">
        <div
          className="flex cursor-pointer items-stretch gap-3 h-full"
          onClick={onToggleExpanded}
          {...dragAttributes}
          {...dragListeners}
        >
          <div className="flex flex-col gap-2 items-center justify-start  ">
            <StopOrderAvatar
              stopOrder={group.firstStopOrder}
              variant={"small"}
            />
            <span className="text-[10px] text-[var(--color-muted)] "> to </span>
            <StopOrderAvatar
              stopOrder={group.lastStopOrder}
              variant={"small"}
            />
          </div>

          <div className="min-w-0 flex-1 flex flex-col self-stretch gap-3">
            <div className="flex  w-full">
              <div className="flex flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {group.label}
                </p>
              </div>
              <div className="flex   justify-end items-center gap-3">
                {group.hasWarnings ? (
                  <FloatingPopover
                    open={warningOpen}
                    onOpenChange={setWarningOpen}
                    offSetNum={6}
                    classes="flex-none"
                    renderInPortal={true}
                    floatingClassName="z-[220]"
                    reference={
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.08))]"
                        onMouseEnter={() => setWarningOpen(true)}
                        onMouseLeave={() => setWarningOpen(false)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TriangleWarningIcon className="h-4 w-4 text-amber-300" />
                      </div>
                    }
                  >
                    <div
                      className="admin-backdrop-blur-xl w-56 rounded-[20px] border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.06))] p-3 text-[0.85rem] text-amber-50/95 shadow-[0_18px_40px_rgba(0,0,0,0.26)]"
                      onMouseEnter={() => setWarningOpen(true)}
                      onMouseLeave={() => setWarningOpen(false)}
                    >
                      Order stop -- has warning.
                    </div>
                  </FloatingPopover>
                ) : null}
                <BoldArrowIcon
                  className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : "rotate-0"}`}
                />
              </div>
            </div>
            <div className="flex justify-end   mt-auto">
              <p className="text-xs text-[var(--color-muted)]">
                {formatRange(group.minEta, group.maxEta, planStartDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {expanded ? (
        <RouteGroupOrderGroupChildren
          entries={group.entries}
          planStartDate={planStartDate}
          routeGroupId={routeGroupId}
          projectedStopOrderByClientId={projectedStopOrderByClientId}
        />
      ) : null}
    </div>
  );
};
