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
    order.order_scalar_id != null ? `#${order.order_scalar_id}` : "#—";
  const streetAddress = order.client_address?.street_address ?? "No address";
  const itemCount = order.total_items ?? 0;
  const orderState = useOrderStateByServerId(order.order_state_id ?? 1);
  const external_source = order.external_source;
  return (
    <div
      className={`admin-glass-panel admin-surface-compact group relative flex flex-col gap-2.5 overflow-vissible rounded-lg p-4 transition-all duration-200 ${
        isHovered
          ? "border-[rgb(var(--color-light-blue-r),0.7)] shadow-[0_18px_42px_rgba(45,95,170,0.22)]"
          : "border-white/10 hover:border-white/18 hover:bg-white/[0.08]"
      }`}
      onClick={() => onOpen?.(order)}
    >
      <OrderMissingInfoNotifier order={order} />

      <div className="pointer-events-none absolute rounded-lg inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />

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
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {external_source}
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {order.archive_at ? (
            <>
              <div className="absolute left-4 top-3 flex items-center rounded-full border border-amber-300/20 bg-amber-500/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100 backdrop-blur-md">
                Archived
              </div>
              <div className="flex items-center content-center pr-1">
                <ConfirmActionButton
                  onConfirm={() => onUnarchive?.(order)}
                  confirmOverLay={"bg-green-700"}
                  deleteContent={
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
                      <SendBackIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                    </div>
                  }
                  confirmContent={"Confirm unarchive"}
                  confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-green-600"
                  duration={4000}
                />
              </div>
            </>
          ) : (
            onArchive && (
              <div className="flex items-center content-center pr-1">
                <ConfirmActionButton
                  onConfirm={() => onArchive?.(order)}
                  deleteContent={
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
                      <ArchiveOrderIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                    </div>
                  }
                  confirmContent={"Confirm archive"}
                  confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-red-500"
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
