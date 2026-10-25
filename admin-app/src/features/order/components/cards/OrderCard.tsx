import { useOrderStateByServerId } from "@/features/order/store/orderStateHooks.store";
import { ArchiveOrderIcon, SendBackIcon } from "@/assets/icons";

import type { Order } from "../../types/order";
import { StateCard } from "@/shared/layout/StateCard";
import {
  ThreeDotMenu,
  type ThreeDotMenuOption,
} from "@/shared/buttons/ThreeDotMenu";
import { OrderOperationTypeBadges } from "./OrderOperationTypeBadges";
import { OrderCardItemPreviews } from "./OrderCardItemPreviews";
import { OrderCardMissingInfoBanner } from "./OrderCardMissingInfoBanner";
import { OrderCardNotesTray } from "./OrderCardNotesTray";

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
  const itemCount = order.total_items ?? 0;
  const orderState = useOrderStateByServerId(order.order_state_id ?? 1);
  const menuOptions: ThreeDotMenuOption[] = order.archive_at
    ? onUnarchive
      ? [
          {
            label: "Unarchive order",
            action: () => onUnarchive(order),
            icon: (
              <SendBackIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
            ),
            confirmation: {
              confirmContent: "Confirm unarchive",
              confirmClassName:
                "flex w-full items-center justify-center rounded-lg bg-success-solid px-3 py-2 text-micro text-success-on-solid",
              confirmOverLay: "bg-success-solid-strong",
              duration: 4000,
            },
          },
        ]
      : []
    : onArchive
      ? [
          {
            label: "Archive order",
            action: () => onArchive(order),
            icon: (
              <ArchiveOrderIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
            ),
            confirmation: {
              confirmContent: "Confirm archive",
              confirmClassName:
                "flex w-full items-center justify-center rounded-lg bg-danger-solid px-3 py-2 text-micro text-danger-on-solid",
              duration: 4000,
            },
          },
        ]
      : [];

  return (
    <div
      className="group relative"
      onClick={() => onOpen?.(order)}
    >
      <div
        className={`admin-glass-panel admin-surface-compact relative z-10 flex flex-col gap-3 overflow-visible rounded-2xl border border-border p-4 transition-all duration-200 ${
          isHovered
            ? "border-[rgb(var(--color-light-blue-r),0.7)] shadow-[var(--shadow-panel-state-strong)]"
            : "border-border group-hover:border-border-accent group-hover:bg-surface-hover"
        }`}
      >
        {order.archive_at && (
          <div className="absolute right-1 -top-3 z-20 flex items-center rounded-full border border-warning-border bg-warning-strong/50 px-2.5 py-1 text-px-8 font-semibold uppercase tracking-[0.14em] text-warning backdrop-blur-md">
            Archived
          </div>
        )}

        <div className="admin-card-sheen pointer-events-none absolute inset-0 rounded-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-2xl font-bold leading-none tracking-tight text-[var(--color-text)]">
              {orderLabel}
            </span>
            <OrderOperationTypeBadges operationType={order.operation_type} size="md" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {orderState && (
              <div className="flex items-center gap-3">
                <StateCard
                  label={orderState.name}
                  color={orderState.color ? orderState.color : "#363636ff"}
                  size="md"
                />
              </div>
            )}
            {menuOptions.length > 0 && (
              <ThreeDotMenu
                dotWidth={4}
                dotHeight={4}
                dotClassName="bg-[var(--color-muted)]"
                triggerClassName="touch-hit-area -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-hover"
                options={menuOptions}
                width={190}
                renderInPortal
              />
            )}
          </div>
        </div>

        <OrderCardItemPreviews
          previews={order.item_previews}
          totalItems={itemCount}
        />

        <OrderCardMissingInfoBanner
          order={order}
          className="-mx-4 -mb-4 mt-0.5"
        />
      </div>
      <OrderCardNotesTray notes={order.order_notes} />
    </div>
  );
};
