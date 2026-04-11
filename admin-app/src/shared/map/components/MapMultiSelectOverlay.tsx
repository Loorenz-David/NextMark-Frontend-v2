import { useState, type ReactNode } from "react";
import { formatMetric } from "@shared-utils";

import { CloseIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";

type MapMultiSelectOverlayProps = {
  isSelectionMode: boolean;
  enableSelectionMode: () => void;
  disableSelectionMode: () => void;
  enableSelectionAriaLabel: string;
  disableSelectionAriaLabel: string;
  enableLabel: ReactNode;
  title: string;
  count: number;
  totalItems: number;
  totalVolume: number;
  totalWeight: number;
  itemTypeCounts?: Record<string, number>;
  actions: ReactNode;
  sideControls?: ReactNode;
};

export const MapMultiSelectOverlay = ({
  isSelectionMode,
  enableSelectionMode,
  disableSelectionMode,
  enableSelectionAriaLabel,
  disableSelectionAriaLabel,
  enableLabel,
  title,
  count,
  totalItems,
  totalVolume,
  totalWeight,
  itemTypeCounts,
  actions,
  sideControls,
}: MapMultiSelectOverlayProps) => {
  const [showStats, setShowStats] = useState(true);
  const itemTypeCountEntries = Object.entries(itemTypeCounts ?? {})
    .filter(([itemType, count]) => itemType.trim().length > 0 && count > 0)
    .sort((leftEntry, rightEntry) => {
      const [leftType, leftCount] = leftEntry;
      const [rightType, rightCount] = rightEntry;
      if (rightCount !== leftCount) return rightCount - leftCount;
      return leftType.localeCompare(rightType);
    });

  if (!isSelectionMode) {
    return (
      <div className="pointer-events-auto absolute left-4 top-4 z-0">
        <BasicButton
          params={{
            variant: "secondaryInvers",
            onClick: enableSelectionMode,
            ariaLabel: enableSelectionAriaLabel,
          }}
        >
          {enableLabel}
        </BasicButton>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-0">
      <div className="relative w-72 rounded-xl border border-[var(--color-muted)]/30 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
        <button
          aria-label={disableSelectionAriaLabel}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/30 bg-[var(--color-page)] text-[var(--color-muted)] shadow-sm"
          onClick={disableSelectionMode}
          type="button"
        >
          <CloseIcon className="h-3 w-3" />
        </button>

        {sideControls}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-muted)]">
            {count} {title}
          </p>
          <button
            className="text-xs text-[var(--color-muted)]/80 underline underline-offset-2"
            onClick={() => setShowStats((prev) => !prev)}
            type="button"
          >
            {showStats ? "Hide stats" : "Show stats"}
          </button>
        </div>

        {showStats && (
          <div className="mb-3 space-y-1 rounded-lg bg-[var(--color-muted)]/5 p-2 text-xs text-[var(--color-muted)]">
            <div className="flex w-full justify-between">
              <p>Total Items:</p>
              <p>{totalItems} pcs</p>
            </div>
            <div className="flex w-full justify-between">
              <p>Total Volume:</p>
              <p>{formatMetric(totalVolume, "㎥")}</p>
            </div>
            <div className="flex w-full justify-between">
              <p>Total Weight:</p>
              <p>{formatMetric(totalWeight, "kg")}</p>
            </div>
            {itemTypeCountEntries.length > 0 ? (
              <div className="mt-2 border-t border-[var(--color-muted)]/15 pt-2">
                <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]/85">
                  Item Types
                </p>
                <div className="space-y-1">
                  {itemTypeCountEntries.map(([itemType, count]) => (
                    <div key={itemType} className="flex w-full justify-between">
                      <p className="truncate pr-2">{itemType}</p>
                      <p>{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </div>
  );
};
