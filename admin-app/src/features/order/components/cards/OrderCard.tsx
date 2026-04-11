import { useEffect, useMemo, useRef, useState } from "react";

import { useOrderStateByServerId } from "@/features/order/store/orderStateHooks.store";
import { ArchiveOrderIcon, ItemIcon, SendBackIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { Order } from "../../types/order";
import { StateCard } from "@/shared/layout/StateCard";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { OrderMissingInfoNotifier } from "../OrderMissingInfoNotifier";
import { OrderOperationTypeBadges } from "./OrderOperationTypeBadges";

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
  const itemTypeCountEntries = useMemo(
    () =>
      Object.entries(order.item_type_counts ?? {})
        .filter(([itemType, count]) => itemType.trim().length > 0 && count > 0)
        .sort((leftEntry, rightEntry) => {
          const [leftType, leftCount] = leftEntry;
          const [rightType, rightCount] = rightEntry;
          if (rightCount !== leftCount) return rightCount - leftCount;
          return leftType.localeCompare(rightType);
        }),
    [order.item_type_counts],
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

  const handleItemCountMouseEnter = () => {
    if (isTouchDevice) return;
    if (!hasItemTypeCounts) return;
    clearItemTypePopoverDelay();
    itemTypePopoverDelayTimeoutRef.current = setTimeout(() => {
      setItemTypePopoverOpen(true);
      itemTypePopoverDelayTimeoutRef.current = null;
    }, 200);
  };

  const handleItemCountMouseLeave = () => {
    if (isTouchDevice) return;
    clearItemTypePopoverDelay();
    setItemTypePopoverOpen(false);
  };

  const handleItemCountClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!hasItemTypeCounts) return;
    if (!isTouchDevice) return;
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
      if (itemTypePopoverDelayTimeoutRef.current == null) return;
      clearTimeout(itemTypePopoverDelayTimeoutRef.current);
      itemTypePopoverDelayTimeoutRef.current = null;
    },
    [],
  );

  const orderState = useOrderStateByServerId(order.order_state_id ?? 1);
  const external_source = order.external_source;
  return (
    <div
      className={`admin-glass-panel admin-surface-compact group relative flex flex-col gap-2.5 overflow-visible rounded-lg p-4 transition-all duration-200 ${
        isHovered
          ? "border-[rgb(var(--color-light-blue-r),0.7)] shadow-[0_18px_42px_rgba(45,95,170,0.22)]"
          : "border-white/10 hover:border-white/18 hover:bg-white/[0.08]"
      }`}
      onClick={() => onOpen?.(order)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />
      <OrderMissingInfoNotifier order={order} />

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
        <div
          className="shrink-0"
          onMouseEnter={handleItemCountMouseEnter}
          onMouseLeave={handleItemCountMouseLeave}
          onClick={handleItemCountClick}
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
      </div>
    </div>
  );
};
