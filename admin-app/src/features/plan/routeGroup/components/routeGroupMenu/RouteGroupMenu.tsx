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
import { PanelMenu, PanelMenuRow } from "@/shared/popups/PanelMenu";

import { useRouteGroupMenuController } from "../../controllers/useRouteGroupMenu.controller";
import type { RouteGroupRailItem } from "../routeGroupRail";
import { RouteSolutionVariantList } from "../RouteSolutionVariantList";

type RouteGroupMenuProps = {
  zones: RouteGroupRailItem[];
  onSelectZone: (routeGroupId: number) => void;
  onCreateRouteGroup: () => void;
};

/**
 * The route plan menu: zone tabs (with "+" for a new route group) pick the
 * route group, and the actions below act on that route group.
 */
export const RouteGroupMenu = ({
  zones,
  onSelectZone,
  onCreateRouteGroup,
}: RouteGroupMenuProps) => {
  const menu = useRouteGroupMenuController();

  const activeIndex = zones.findIndex((zone) => zone.isActive);
  const activeZone = activeIndex >= 0 ? zones[activeIndex] : null;

  const renderContent = (close: () => void) => {
    const runAndClose = (action: () => void) => () => {
      close();
      action();
    };

    return (
      <>
        <SlidingTabRow
          tabs={zones.map((zone) => ({
            id: zone.route_group_id,
            label: zone.label,
          }))}
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
                {activeZone.orderCount}{" "}
                {activeZone.orderCount === 1 ? "order" : "orders"} ·{" "}
                {Math.round(activeZone.completionRatio)}% done
              </p>
              {menu.stateLabel ? (
                <StateCard label={menu.stateLabel} color={menu.stateColor} />
              ) : null}
            </div>
            <div className="flex flex-col p-2">
              <PanelMenuRow
                icon={
                  <PlusIcon className="h-4 w-4 stroke-[var(--color-muted)]" />
                }
                label="Add order"
                onClick={runAndClose(menu.actions.createOrder)}
              />
              <PanelMenuRow
                icon={
                  <EditIcon className="h-4 w-4 stroke-[var(--color-muted)]" />
                }
                label="Edit route group"
                onClick={runAndClose(menu.actions.editRouteGroup)}
              />
              <PanelMenuRow
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
                attention={menu.needsOptimization}
              />
              {menu.hasRouteVariants ? (
                <div className="mx-1 mb-1 rounded-xl bg-surface-subtle p-1">
                  <p className="px-2 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Route variants
                  </p>
                  <RouteSolutionVariantList />
                </div>
              ) : null}
              <PanelMenuRow
                icon={
                  <DeliveryReadyIcon className="h-4 w-4 text-[var(--color-muted)]" />
                }
                label="Ready for delivery"
                onClick={runAndClose(menu.actions.markReadyForDelivery)}
                disabled={!menu.canMarkReady || menu.isBusy}
              />
              <div className="mx-3 my-1 border-t border-border" />
              <PanelMenuRow
                icon={<PdfIcon className="h-5 w-5" />}
                label="Download route"
                onClick={runAndClose(menu.actions.downloadRoute)}
              />
              <PanelMenuRow
                icon={<CsvIcon className="h-4 w-4" />}
                label={
                  menu.importControls.loading
                    ? "Importing orders..."
                    : "Import orders (CSV)"
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
      </>
    );
  };

  return (
    <>
      <PanelMenu ariaLabel="Route plan menu" attention={menu.needsOptimization}>
        {renderContent}
      </PanelMenu>
      <OrderImportButton
        planId={menu.planId}
        onReady={menu.handleImportReady}
      />
    </>
  );
};
