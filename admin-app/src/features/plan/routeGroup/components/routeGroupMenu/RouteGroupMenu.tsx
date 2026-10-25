import { useState, type ReactNode } from "react";

import { useMobile } from "@/app/viewport";
import {
  CsvIcon,
  DeliveryReadyIcon,
  EditIcon,
  PdfIcon,
  PlusIcon,
  ThunderIcon,
} from "@/assets/icons";
import { OrderImportButton } from "@/features/order/components/OrderImportButton";
import { StateCard } from "@/shared/layout/StateCard";
import { SlidingTabRow } from "@/shared/layout/slidingTabs";
import { BottomSheet } from "@/shared/overlays/bottomSheet";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import { useRouteGroupMenuController } from "../../controllers/useRouteGroupMenu.controller";
import type { RouteGroupRailItem } from "../routeGroupRail";
import { RouteSolutionVariantList } from "../RouteSolutionVariantList";

type RouteGroupMenuProps = {
  zones: RouteGroupRailItem[];
  onSelectZone: (routeGroupId: number) => void;
  onCreateRouteGroup: () => void;
};

const stopDragActivation = {
  onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  onMouseDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  onTouchStart: (event: { stopPropagation: () => void }) => event.stopPropagation(),
};

const MenuRow = ({
  icon,
  label,
  onClick,
  disabled,
  accent,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Marks the row as the one that needs attention. */
  accent?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors hover:bg-surface-hover active:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 ${
      accent ? "font-semibold text-[var(--optimize-ink)]" : "text-[var(--color-text)]"
    }`}
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {accent ? <AttentionDot /> : null}
  </button>
);

const AttentionDot = () => (
  <span
    aria-hidden="true"
    className="block h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: "rgb(var(--optimize-r))" }}
  />
);

/**
 * The route plan menu: zone tabs (with "+" for a new route group) pick the
 * route group, and the actions below act on that route group. A popover on desktop, a bottom sheet for
 * fingers.
 */
export const RouteGroupMenu = ({
  zones,
  onSelectZone,
  onCreateRouteGroup,
}: RouteGroupMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isCoarsePointer } = useMobile();
  const menu = useRouteGroupMenuController();

  const activeIndex = zones.findIndex((zone) => zone.isActive);
  const activeZone = activeIndex >= 0 ? zones[activeIndex] : null;

  const close = () => setIsOpen(false);
  const runAndClose = (action: () => void) => () => {
    close();
    action();
  };

  const content = (
    <div className="flex flex-col" {...stopDragActivation}>
      <SlidingTabRow
        tabs={zones.map((zone) => ({ id: zone.route_group_id, label: zone.label }))}
        activeIndex={activeIndex >= 0 ? activeIndex : null}
        onSelect={(index) => {
          const zone = zones[index];
          if (zone) onSelectZone(zone.route_group_id);
        }}
        ariaLabel="Zones"
        className="border-b border-border bg-surface-subtle"
        trailing={
          <button
            type="button"
            onClick={runAndClose(onCreateRouteGroup)}
            aria-label="New route group"
            title="New route group"
            className="touch-hit-area flex w-11 shrink-0 cursor-pointer items-center justify-center border-l border-border transition-colors hover:bg-surface-hover active:bg-surface-hover"
          >
            <PlusIcon className="h-4 w-4 stroke-[var(--color-text)]" />
          </button>
        }
      />

      {activeZone && menu.hasActiveRouteGroup ? (
        <>
          <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
            <p className="min-w-0 truncate text-xs text-[var(--color-muted)]">
              {activeZone.orderCount} {activeZone.orderCount === 1 ? "order" : "orders"} ·{" "}
              {Math.round(activeZone.completionRatio)}% done
            </p>
            {menu.stateLabel ? (
              <StateCard label={menu.stateLabel} color={menu.stateColor} />
            ) : null}
          </div>
          <div className="flex flex-col p-2">
            <MenuRow
              icon={<PlusIcon className="h-4 w-4 stroke-[var(--color-muted)]" />}
              label="Add order"
              onClick={runAndClose(menu.actions.createOrder)}
            />
            <MenuRow
              icon={<EditIcon className="h-4 w-4 stroke-[var(--color-muted)]" />}
              label="Edit route group"
              onClick={runAndClose(menu.actions.editRouteGroup)}
            />
            <MenuRow
              icon={
                <ThunderIcon
                  className={`h-4 w-4 ${
                    menu.needsOptimization
                      ? "text-[var(--optimize-ink)]"
                      : "text-[var(--color-muted)]"
                  }`}
                />
              }
              label={menu.optimizeLabel}
              onClick={runAndClose(menu.actions.optimizeRoute)}
              disabled={!menu.canOptimize}
              accent={menu.needsOptimization}
            />
            {menu.hasRouteVariants ? (
              <div className="mx-1 mb-1 rounded-xl bg-surface-subtle p-1">
                <p className="px-2 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Route variants
                </p>
                <RouteSolutionVariantList />
              </div>
            ) : null}
            <MenuRow
              icon={<DeliveryReadyIcon className="h-4 w-4 text-[var(--color-muted)]" />}
              label="Ready for delivery"
              onClick={runAndClose(menu.actions.markReadyForDelivery)}
              disabled={!menu.canMarkReady || menu.isBusy}
            />
            <div className="mx-3 my-1 border-t border-border" />
            <MenuRow
              icon={<PdfIcon className="h-5 w-5" />}
              label="Download route"
              onClick={runAndClose(menu.actions.downloadRoute)}
            />
            <MenuRow
              icon={<CsvIcon className="h-4 w-4" />}
              label={
                menu.importControls.loading ? "Importing orders..." : "Import orders (CSV)"
              }
              onClick={runAndClose(menu.importControls.triggerFileInput)}
              disabled={menu.importControls.disabled}
            />
          </div>
        </>
      ) : (
        <p className="px-4 py-4 text-sm text-[var(--color-muted)]">
          Choose a zone to see its actions.
        </p>
      )}
    </div>
  );

  const trigger = (
    <button
      type="button"
      aria-label="Route plan menu"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={(event) => {
        event.stopPropagation();
        setIsOpen((current) => !current);
      }}
      {...stopDragActivation}
      className="touch-hit-area relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-button-compact)] transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
      </span>
      {menu.needsOptimization ? (
        <span className="absolute right-0 top-0 flex rounded-full border-2 border-[var(--color-page)]">
          <AttentionDot />
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      {isCoarsePointer ? (
        <>
          {trigger}
          <BottomSheet open={isOpen} onClose={close} bodyClassName="pb-2">
            {content}
          </BottomSheet>
        </>
      ) : (
        <FloatingPopover
          open={isOpen}
          onOpenChange={setIsOpen}
          reference={trigger}
          placement="bottom-end"
          offSetNum={8}
          renderInPortal
          strategy="fixed"
          floatingClassName="z-[220]"
        >
          <div className="admin-glass-popover w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-[var(--color-border-accent)] shadow-xl">
            {content}
          </div>
        </FloatingPopover>
      )}
      <OrderImportButton planId={menu.planId} onReady={menu.handleImportReady} />
    </>
  );
};
