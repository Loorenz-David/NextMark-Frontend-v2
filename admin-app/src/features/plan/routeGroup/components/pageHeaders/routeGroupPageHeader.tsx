import { useCallback, useState } from "react";
import { motion } from "framer-motion";

import { planIconTypeMap } from "@/features/plan/utils/planIconTypeMap";
import { BasicButton } from "@/shared/buttons";
import {
  CsvIcon,
  EditIcon,
  PdfIcon,
  PlusIcon,
  RetryIcon,
} from "@/assets/icons";
import { RouteOptimizationDropdownButton } from "../RouteOptimizationDropdownButton";
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu";
import { OrderImportButton } from "@/features/order/components/OrderImportButton";
import type { OrderImportControls } from "@/features/order/components/OrderImportButton";
import type { RouteGroupHeaderSummary } from "../../domain/buildRouteGroupHeaderSummary";
import {
  useRouteGroupPageCommands,
  useRouteGroupPageState,
} from "../../context/useRouteGroupPageContext";
import { cn } from "@/lib/utils/cn";
import { formatMetric } from "@shared-utils";

type RouteGroupsPageHeaderProps = {
  summary: RouteGroupHeaderSummary;
  onRequestClose?: () => void;
};

const actionBarShellClassName =
  "border-b border-[rgba(255,255,255,0.08)] bg-[rgba(14,22,23,0.72)] px-5 pb-4 pt-3 backdrop-blur-[28px] saturate-[125%] supports-[backdrop-filter]:bg-[rgba(14,22,23,0.62)]";

type RouteGroupHeaderActionBarProps = {
  showOptimizeRow: boolean;
  importControls: OrderImportControls;
  onCreateOrder: () => void;
  onEditPlan: () => void;
  onOptimizeRoute: () => void;
  onPrintRoute: () => void;
};

const RouteGroupHeaderActionBar = ({
  showOptimizeRow,
  importControls,
  onCreateOrder,
  onEditPlan,
  onOptimizeRoute,
  onPrintRoute,
}: RouteGroupHeaderActionBarProps) => {
  return (
    <div className={actionBarShellClassName}>
      <div className="flex flex-col gap-3">
        <div className="flex w-full items-center gap-3">
          <BasicButton
            params={{
              variant: "primary",
              onClick: onCreateOrder,
              ariaLabel: "Create Delivery order",
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
            Order
          </BasicButton>
          <BasicButton
            params={{
              variant: "secondary",
              onClick: onEditPlan,
              ariaLabel: "Edit route group",
            }}
          >
            <EditIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
            Edit
          </BasicButton>

          <ThreeDotMenu
            dotWidth={3}
            dotHeight={3}
            dotClassName={"bg-[var(--color-muted)]"}
            triggerClassName={
              "p-2 w-5 rounded-full bg-[var(--color-page)] border border-[var(--color-border)] shadow-sm ml-auto cursor-pointer"
            }
            options={[
              {
                label: "Update optimization",
                action: onOptimizeRoute,
                icon: <RetryIcon className="h-4 w-4" />,
              },
              {
                label: "Download route",
                action: onPrintRoute,
                icon: <PdfIcon className="h-6 w-6" />,
              },
              {
                label: importControls.loading
                  ? "Importing orders..."
                  : "Import orders (CSV)",
                action: importControls.triggerFileInput,
                icon: <CsvIcon className="h-4 w-4" />,
                disabled: importControls.disabled,
              },
            ]}
          />
        </div>

        {showOptimizeRow ? (
          <div className="flex w-full">
            <RouteOptimizationDropdownButton className="w-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const RouteGroupsPageHeader = ({
  summary,
  onRequestClose,
}: RouteGroupsPageHeaderProps) => {
  const PlanTypeIcon = planIconTypeMap.local_delivery;

  return (
    <header className="flex w-full min-w-0 flex-col shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <div className="admin-glass-divider flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3 transition-colors duration-200">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <div className="inline-flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.06] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <div className="min-w-0 flex-1 text-lg font-semibold text-[var(--color-text)]">
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="truncate">{summary.title}</span>
              <p className="truncate text-[11px] font-normal text-[var(--color-muted)]">
                {summary.orderCount} orders • {summary.itemCount} items •{" "}
                {formatMetric(summary.totalVolume, "㎥")} •{" "}
                {formatMetric(summary.totalWeight, "kg")}
              </p>
              {summary.subtitle ? (
                <p className="truncate text-[11px] font-normal text-[var(--color-muted)]/80">
                  {summary.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        {onRequestClose ? (
          <BasicButton
            params={{
              variant: "text",
              onClick: onRequestClose,
              ariaLabel: "Close route groups page",
              className: "shrink-0",
            }}
          >
            Close
          </BasicButton>
        ) : null}
      </div>
    </header>
  );
};

export const RouteGroupsActionBar = ({
  useFloatingActionBar = false,
  isActionBarVisible = true,
  showOptimizeRow: showOptimizeRowProp,
}: {
  useFloatingActionBar?: boolean;
  isActionBarVisible?: boolean;
  showOptimizeRow?: boolean;
} = {}) => {
  const { routeGroupPageActions } = useRouteGroupPageCommands();
  const { plan, routeGroup, orderCount, selectedRouteSolution } =
    useRouteGroupPageState();
  const [importControls, setImportControls] = useState<OrderImportControls>({
    triggerFileInput: () => undefined,
    loading: false,
    disabled: true,
  });
  const handleImportReady = useCallback((controls: OrderImportControls) => {
    setImportControls(controls);
  }, []);
  const hasRouteWarnings = selectedRouteSolution?.has_route_warnings;
  const isNotOptimize = selectedRouteSolution?.is_optimized == "not optimize";
  const isLoading = routeGroup?.is_loading;
  const showOptimizeRow =
    showOptimizeRowProp ??
    Boolean(orderCount > 0 && (isNotOptimize || hasRouteWarnings));

  return (
    <>
      {!isLoading ? (
        <motion.div
          key="header-route-group-button"
          initial={false}
          animate={{
            opacity: useFloatingActionBar ? (isActionBarVisible ? 1 : 0) : 1,
            y: useFloatingActionBar ? (isActionBarVisible ? 0 : -18) : 0,
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            useFloatingActionBar ? "absolute inset-x-0 top-0 z-20" : "w-full",
          )}
          style={{
            pointerEvents:
              !useFloatingActionBar || isActionBarVisible ? "auto" : "none",
          }}
        >
          <RouteGroupHeaderActionBar
            showOptimizeRow={showOptimizeRow}
            importControls={importControls}
            onCreateOrder={routeGroupPageActions.handleCreateOrder}
            onEditPlan={routeGroupPageActions.handleEditLocalPlan}
            onOptimizeRoute={routeGroupPageActions.optimizeRoute}
            onPrintRoute={routeGroupPageActions.handlePrintRouteSolution}
          />
        </motion.div>
      ) : null}
      <OrderImportButton planId={plan?.id} onReady={handleImportReady} />
    </>
  );
};
