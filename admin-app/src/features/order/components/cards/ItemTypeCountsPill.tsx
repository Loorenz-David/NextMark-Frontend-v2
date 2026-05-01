import { useEffect, useMemo, useRef, useState } from "react";

import { ItemIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

type ItemTypeCountsPillProps = {
  itemCount: number;
  itemTypeCounts?: Record<string, number> | null;
};

export const ItemTypeCountsPill = ({
  itemCount,
  itemTypeCounts,
}: ItemTypeCountsPillProps) => {
  const itemTypeCountEntries = useMemo(
    () =>
      Object.entries(itemTypeCounts ?? {})
        .filter(([itemType, count]) => itemType.trim().length > 0 && count > 0)
        .sort((leftEntry, rightEntry) => {
          const [leftType, leftCount] = leftEntry;
          const [rightType, rightCount] = rightEntry;
          if (rightCount !== leftCount) return rightCount - leftCount;
          return leftType.localeCompare(rightType);
        }),
    [itemTypeCounts],
  );
  const hasItemTypeCounts = itemTypeCountEntries.length > 0;
  const [itemTypePopoverOpen, setItemTypePopoverOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const itemTypePopoverDelayTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearItemTypePopoverDelay = () => {
    if (itemTypePopoverDelayTimeoutRef.current == null) return;
    clearTimeout(itemTypePopoverDelayTimeoutRef.current);
    itemTypePopoverDelayTimeoutRef.current = null;
  };

  const handleMouseEnter = () => {
    if (isTouchDevice || !hasItemTypeCounts) return;
    clearItemTypePopoverDelay();
    itemTypePopoverDelayTimeoutRef.current = setTimeout(() => {
      setItemTypePopoverOpen(true);
      itemTypePopoverDelayTimeoutRef.current = null;
    }, 200);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    clearItemTypePopoverDelay();
    setItemTypePopoverOpen(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!hasItemTypeCounts || !isTouchDevice) return;
    setItemTypePopoverOpen((current) => !current);
  };

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const syncDeviceType = () => {
      setIsTouchDevice(mediaQuery.matches);
    };

    syncDeviceType();
    mediaQuery.addEventListener("change", syncDeviceType);

    return () => {
      mediaQuery.removeEventListener("change", syncDeviceType);
    };
  }, []);

  useEffect(
    () => () => {
      clearItemTypePopoverDelay();
    },
    [],
  );

  return (
    <div
      className="shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <FloatingPopover
        open={itemTypePopoverOpen}
        onOpenChange={setItemTypePopoverOpen}
        classes="relative"
        offSetNum={8}
        renderInPortal={true}
        matchReferenceWidth={false}
        floatingClassName="z-[120]"
        reference={
          <div
            className={`flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 ${
              hasItemTypeCounts
                ? "cursor-pointer transition-all duration-200 hover:border-[rgb(var(--color-light-blue-r),0.45)] hover:shadow-[0_0_0_1px_rgba(113,205,233,0.2),0_0_16px_rgba(72,180,194,0.18)]"
                : ""
            }`}
          >
            <ItemIcon className="h-3 w-3 text-[var(--color-primary)]/85" />
            <span>{itemCount}</span>
          </div>
        }
      >
        <div className="admin-glass-popover min-w-[11rem] rounded-lg border border-white/14 bg-[rgba(9,16,26,0.92)] px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.36)] backdrop-blur-md">
          <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]/90">
            Item Types
          </div>
          <div className="space-y-1">
            {itemTypeCountEntries.map(([itemType, count]) => (
              <div
                key={itemType}
                className="grid grid-cols-[1fr_auto] items-center gap-4 text-xs"
              >
                <span className="truncate text-[var(--color-text)]/92">
                  {itemType}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FloatingPopover>
    </div>
  );
};
