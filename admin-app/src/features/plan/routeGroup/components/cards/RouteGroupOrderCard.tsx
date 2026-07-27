import { TimeIcon } from "@/assets/icons";
import { StateCard } from "@/shared/layout/StateCard";
import { useOrderStateByServerId } from "@/features/order/store/orderStateHooks.store";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import { RouteStopWarnings } from "../warnings/RouteStopWarnings";
import { formatRouteTime } from "@/features/plan/routeGroup/utils/formatRouteTime";
import {
  OrderCardItemPreviews,
  OrderCardMissingInfoBanner,
  OrderCardNotesTray,
  OrderOperationTypeBadges,
  useOrderActions,
  type Order,
} from "@/features/order";
import { StopOrderAvatar } from "./StopOrderAvatar";
import { OrderTimeLoadingPill } from "@/shared/loadingCards/order";

type RouteGroupOrderCardProps = {
  order: Order;
  stop?: RouteSolutionStop | null;
  displayStopOrder?: number | null;
  planStartDate?: string | null;
  routeGroupId?: number | null;
};

export const RouteGroupOrderCard = ({
  order,
  stop,
  displayStopOrder,
  planStartDate,
  routeGroupId,
}: RouteGroupOrderCardProps) => {
  const { openOrderDetail } = useOrderActions();
  const orderLabel =
    order.external_source && order.reference_number
      ? order.reference_number
      : order.order_scalar_id != null
        ? `#${order.order_scalar_id}`
        : "#—";
  const streetAddress = order.client_address?.street_address ?? "No address";
  const expectedArrival =
    stop && stop.expected_arrival_time !== "loading"
      ? formatRouteTime(stop.expected_arrival_time, planStartDate)
      : null;
  const itemCount = order.total_items ?? 0;
  const stopOrder =
    typeof displayStopOrder === "number"
      ? displayStopOrder
      : typeof stop?.stop_order == "number"
        ? stop.stop_order
        : null;
  const orderState = useOrderStateByServerId(order.order_state_id ?? 1);
  const openOrder = () => {
    openOrderDetail(
      {
        mode: "edit",
        clientId: order.client_id,
        openSource: "card",
        routeGroupId: routeGroupId ?? order.route_group_id ?? null,
        planStartDate: planStartDate ?? null,
        headerBehavior: "order-main-context",
      },
      { borderLeft: "rgb(var(--color-light-blue-r),0.7)" },
    );
  };

  return (
    <div className="group relative" onClick={openOrder}>
      <div className="admin-glass-panel admin-surface-compact relative z-10 flex flex-col gap-2.5 overflow-visible rounded-lg border border-border p-4 pl-2 transition-all duration-200 group-hover:border-border-accent group-hover:bg-surface-hover group-hover:shadow-[var(--shadow-panel-card)]">
        <div className="admin-card-sheen [--card-sheen-stop:26%] pointer-events-none absolute inset-0 rounded-lg" />

        <div className="relative z-10 flex w-full gap-3">
          <StopOrderAvatar stopOrder={stopOrder} />
          <div className="flex min-w-0 flex-col gap-2 flex-1 pl-1">
            <div className="flex justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-base font-semibold text-[var(--color-text)]">
                  {orderLabel}
                </span>
                <OrderOperationTypeBadges
                  operationType={order.operation_type}
                />
                <span className="shrink-0 text-[var(--color-muted)]/60">·</span>
                <span className="min-w-0 truncate text-xs text-[var(--color-muted)]/95">
                  {streetAddress}
                </span>
              </div>
              {orderState && (
                <div className="flex shrink-0 gap-3 items-center">
                  <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
                  <StateCard
                    label={orderState.name}
                    color={orderState.color ? orderState.color : "#363636ff"}
                  />
                </div>
              )}
            </div>
            <div className="flex w-full items-end justify-between gap-3">
              <OrderCardItemPreviews
                previews={order.item_previews}
                totalItems={itemCount}
              />
              <div className="flex items-center justify-end gap-3 text-xs text-[var(--color-muted)]">
                {expectedArrival ? (
                  <div className="flex min-w-[72px] items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-raised px-2 py-1">
                    <>
                      <TimeIcon className="h-3 w-3 text-[var(--color-light-blue)]" />
                      <span className="whitespace-nowrap">{expectedArrival}</span>
                    </>
                  </div>
                ) : streetAddress ? (
                  <OrderTimeLoadingPill />
                ) : (
                  "--"
                )}
              </div>
            </div>
          </div>
        </div>

        <OrderCardMissingInfoBanner
          order={order}
          className="-mb-4 -ml-2 -mr-4 mt-0.5"
        />
      </div>
      <OrderCardNotesTray notes={order.order_notes} />
    </div>
  );
};
