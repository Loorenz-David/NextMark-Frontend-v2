import type { StackComponentProps } from "@/shared/stack-manager/types";
import { SlideCarousel } from "@/shared/layout/slideCarousel";

import { ItemsOrderPreview } from "../item";

import { OrderDetailSummary } from "../components/OrderDetailSummary";
import { OrderDetailNotesTab } from "../components/OrderDetailNotesTab";
import { OrderDetailTracking } from "../components/OrderDetailTracking";
import { OrderDetailEventHistory } from "../components/OrderDetailEventHistory";
import { OrderDetailHeader } from "../components/pageHeaders/OrderDetailHeader";
import { OrderDetailProvider } from "../context/OrderDetailProvider";
import { useOrderDetailContext } from "../context/OrderDetailContext";
import { OrderDetailTimeWindows } from "../components/OrderDetailTimeWindows";
import { useOrderDetailStopWarningController } from "../controllers/useOrderDetailStopWarning.controller";
import type { OrderDetailPayload } from "../domain/orderDetailPayload.types";

const OrderDetailContent = ({ payload }: { payload?: OrderDetailPayload }) => {
  const {
    order,
    orderState,
    orderServerId,
    isRefreshing,
    openOrderForm,
    openOrderCases,
    closeOrderDetail,
    advanceDetailOrderState,
  } = useOrderDetailContext();
  const {
    initialCarouselIndex,
    timeWindowHeaderAddon,
    trackingMissingRequiredFields,
  } = useOrderDetailStopWarningController({
    order,
    routeGroupId: payload?.routeGroupId ?? null,
    planStartDate: payload?.planStartDate ?? null,
  });

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--color-page)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-[var(--color-primary)]/30" />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin">
        <OrderDetailHeader
          openOrderForm={openOrderForm}
          openOrderCases={openOrderCases}
          onClose={closeOrderDetail}
          onAdvanceOrderState={advanceDetailOrderState}
          order={order}
          headerBehavior={payload?.headerBehavior ?? null}
        />

        <div className="flex w-full flex-col gap-6 bg-[var(--color-page)] pb-6 pt-3">
          <div className="flex flex-col gap-4 px-5 ">
            <SlideCarousel
              key={`${order?.client_id ?? "empty"}:${initialCarouselIndex}`}
              initialIndex={initialCarouselIndex}
            >
              {isRefreshing && !order ? (
                <div className="admin-glass-panel rounded-[22px] p-4 text-sm text-[var(--color-muted)]">
                  Loading order details...
                </div>
              ) : order ? (
                <OrderDetailSummary order={order} orderState={orderState} />
              ) : (
                <div className="admin-glass-panel rounded-[22px] p-4 text-sm text-[var(--color-muted)]">
                  Order not found.
                </div>
              )}

              {order ? <OrderDetailNotesTab order={order} /> : null}

              {order ? (
                <OrderDetailTracking
                  order={order}
                  missingRequiredFields={trackingMissingRequiredFields}
                />
              ) : null}

              {order ? (
                <OrderDetailTimeWindows
                  order={order}
                  headerRight={timeWindowHeaderAddon}
                />
              ) : null}

              <OrderDetailEventHistory orderId={orderServerId} />
            </SlideCarousel>
          </div>

          {isRefreshing && order ? (
            <div className="px-5 pt-2 text-xs text-[var(--color-muted)]">
              Refreshing order details...
            </div>
          ) : null}

          {orderServerId !== null ? (
            <div className="flex w-full flex-col bg-[var(--color-muted)]/10">
              <ItemsOrderPreview
                orderId={orderServerId}
                expectedItemCount={order?.total_items ?? null}
                itemsUpdatedAt={order?.items_updated_at ?? null}
                stickyHeader
              />
            </div>
          ) : (
            <div className="admin-glass-panel mx-5 rounded-[22px] p-4 text-xs text-[var(--color-muted)]">
              Items are available after the order has a server id.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderDetailPage = ({
  payload,
  onClose,
}: StackComponentProps<OrderDetailPayload>) => (
  <OrderDetailProvider payload={payload} onClose={onClose}>
    <OrderDetailContent payload={payload} />
  </OrderDetailProvider>
);
