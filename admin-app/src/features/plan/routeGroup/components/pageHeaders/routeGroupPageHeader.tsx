import type { ReactNode } from "react";

import { useMobile } from "@/app/viewport";
import { CloseIcon } from "@/assets/icons";
import { planIconTypeMap } from "@/features/plan/utils/planIconTypeMap";
import { PageBackButton } from "@/shared/buttons";
import type { RouteGroupHeaderSummary } from "../../domain/buildRouteGroupHeaderSummary";
import { formatMetric } from "@shared-utils";

type RouteGroupsPageHeaderProps = {
  summary: RouteGroupHeaderSummary;
  onRequestClose?: () => void;
  /** The route plan menu (zones and route group actions). */
  menu?: ReactNode;
};

export const RouteGroupsPageHeader = ({
  summary,
  onRequestClose,
  menu,
}: RouteGroupsPageHeaderProps) => {
  const PlanTypeIcon = planIconTypeMap.local_delivery;
  const { isMobile } = useMobile();

  return (
    <header className="relative isolate flex w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-page-header)] shadow-[var(--shadow-panel-section)]">
      <div
        aria-hidden="true"
        className="admin-context-header-texture admin-context-header-texture--route"
      />
      <div className="admin-glass-divider relative z-10 flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3 transition-colors duration-200">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {isMobile && onRequestClose ? (
            <PageBackButton onClick={onRequestClose} ariaLabel="Close route groups page" />
          ) : null}
          <div className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-hover px-3 py-3 shadow-[inset_0_1px_0_var(--color-ligth-bg)]">
            <PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <div className="min-w-0 flex-1 text-lg font-semibold text-[var(--color-text)]">
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="truncate">{summary.title}</span>
              <p className="truncate text-2xs font-normal text-[var(--color-muted)]">
                {summary.orderCount} orders • {summary.itemCount} items •{" "}
                {formatMetric(summary.totalVolume, "㎥")} •{" "}
                {formatMetric(summary.totalWeight, "kg")}
              </p>
              {summary.subtitle ? (
                <p className="truncate text-2xs font-normal text-[var(--color-muted)]/80">
                  {summary.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        {menu || (onRequestClose && !isMobile) ? (
          <div className="flex shrink-0 items-center gap-2">
            {menu}
            {onRequestClose && !isMobile ? (
              <button
                type="button"
                onClick={onRequestClose}
                aria-label="Close route groups page"
                className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-button-compact)] transition-colors hover:bg-surface-hover active:bg-surface-hover"
              >
                <CloseIcon className="h-3.5 w-3.5 text-[var(--color-text)]" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};
