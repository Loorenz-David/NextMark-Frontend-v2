import { useOrderStateByServerId } from "@/features/order/store/orderStateHooks.store";
import { ArchiveOrderIcon, SendBackIcon } from "@/assets/icons";

import type { Order } from "../../types/order";
import { StateCard } from "@/shared/layout/StateCard";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { OrderMissingInfoNotifier } from "../OrderMissingInfoNotifier";
import { OrderOperationTypeBadges } from "./OrderOperationTypeBadges";
import { ItemTypeCountsPill } from "./ItemTypeCountsPill";

type OrderCardProps = {
  order: Order;
  onOpen?: (order: Order) => void;
  onArchive?: (order: Order) => void;
  onUnarchive?: (order: Order) => void;
  isHovered?: boolean;
};

export const OrderCard = ({
  order,
  onOpen,
  onArchive,
  onUnarchive,
  isHovered = false,
}: OrderCardProps) => {
  const orderLabel =
    order.external_source && order.reference_number
      ? order.reference_number
      : order.order_scalar_id != null
        ? `#${order.order_scalar_id}`
        : "#—";
  const streetAddress = order.client_address?.street_address ?? "No address";
  const itemCount = order.total_items ?? 0;
  const orderState = useOrderStateByServerId(order.order_state_id ?? 1);
  const external_source = order.external_source;
  return (
    <div
      className={`admin-glass-panel admin-surface-compact group relative flex flex-col gap-2.5 overflow-visible rounded-lg p-4 transition-all duration-200 ${
        isHovered
          ? "border-[rgb(var(--color-light-blue-r),0.7)] shadow-[var(--shadow-panel-state-strong)]"
          : "border-border hover:border-border-accent hover:bg-surface-hover"
      }`}
      onClick={() => onOpen?.(order)}
    >
      <OrderMissingInfoNotifier order={order} />
      {order.archive_at && (
        <div className="absolute right-1 -top-3 z-20 flex items-center rounded-full border border-warning-border bg-warning-strong/50 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-warning backdrop-blur-md">
          Archived
        </div>
      )}

      <div className="pointer-events-none absolute rounded-lg inset-0 bg-[linear-gradient(180deg,var(--glass-surface-weak),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-base font-semibold text-[var(--color-text)]">
              {orderLabel}
            </span>
            <OrderOperationTypeBadges operationType={order.operation_type} />
          </div>
          {external_source && (
            <div className="flex items-center justify-center">
              <span className="shrink-0 rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {external_source}
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {order.archive_at ? (
            <div className="flex items-center content-center pr-1">
              <ConfirmActionButton
                onConfirm={() => onUnarchive?.(order)}
                confirmOverLay={"bg-success-solid-strong"}
                deleteContent={
                  <div className="rounded-lg border border-border bg-surface-raised px-1.5 py-1.5 shadow-[var(--shadow-button-action)]">
                    <SendBackIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                  </div>
                }
                confirmContent={"Confirm unarchive"}
                confirmClassName="text-success-on-solid text-[10px] px-2 py-1 rounded-md bg-success-solid"
                duration={4000}
              />
            </div>
          ) : (
            onArchive && (
              <div className="flex items-center content-center pr-1">
                <ConfirmActionButton
                  onConfirm={() => onArchive?.(order)}
                  deleteContent={
                    <div className="rounded-lg border border-border bg-surface-raised px-1.5 py-1.5 shadow-[var(--shadow-button-action)]">
                      <ArchiveOrderIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                    </div>
                  }
                  confirmContent={"Confirm archive"}
                  confirmClassName="text-danger-on-solid text-[10px] px-2 py-1 rounded-md bg-danger-solid"
                  duration={4000}
                />
              </div>
            )
          )}
          {orderState && (
            <div className="flex items-center gap-3">
              <StateCard
                label={orderState.name}
                color={orderState.color ? orderState.color : "#363636ff"}
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <span className="truncate text-xs text-[var(--color-muted)]/95">
          {streetAddress}
        </span>
        <ItemTypeCountsPill
          itemCount={itemCount}
          itemTypeCounts={order.item_type_counts}
        />
      </div>
    </div>
  );
};
