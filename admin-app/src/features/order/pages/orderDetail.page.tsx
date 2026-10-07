import { useMobile } from "@/app/viewport";
import type { StackComponentProps } from "@/shared/stack-manager/types";
import { SlideCarousel } from "@/shared/layout/slideCarousel";

import { ItemsOrderPreview } from "../item";

import { OrderDetailSummary } from "../components/OrderDetailSummary";
import { OrderDetailNotesTab } from "../components/OrderDetailNotesTab";
import { OrderDetailEventHistory } from "../components/OrderDetailEventHistory";
import { OrderDetailHeader } from "../components/pageHeaders/OrderDetailHeader";
import { OrderDetailHeaderMobile } from "../components/pageHeaders/OrderDetailHeaderMobile";
import { OrderDetailMobileSections } from "../components/OrderDetailMobileSections";
import { OrderDetailProvider } from "../context/OrderDetailProvider";
import { useOrderDetailContext } from "../context/OrderDetailContext";
import { OrderDetailTimeWindows } from "../components/OrderDetailTimeWindows";
import { useOrderDetailPageController } from "../controllers/useOrderDetailPage.controller";
import type { OrderDetailPayload } from "../domain/orderDetailPayload.types";

const OrderDetailContent = ({ payload }: { payload?: OrderDetailPayload }) => {
  const {
    order,
    orderState,
    orderServerId,
    isRefreshing,
    openOrderForm,
    closeOrderDetail,
    advanceDetailOrderState,
  } = useOrderDetailContext();
  const {
    initialCarouselIndex,
    timeWindowHeaderAddon,
    missingRequiredFields,
    handleMissingOrderInfoClick,
    handleTrackingLinkCopy,
  } = useOrderDetailPageController({
    order,
    focusEventId: payload?.focusEventId ?? null,
    routeGroupId: payload?.routeGroupId ?? null,
    planStartDate: payload?.planStartDate ?? null,
  });
  const { isMobile } = useMobile();

  // One element per section, in carousel order (details, notes, windows,
  // history). Kept as an array, not a fragment: both the desktop carousel
  // and the phone switcher count children to know how many sections exist.
  const sections = [
    isRefreshing && !order ? (
      <div
        key="details"
        className="admin-glass-panel rounded-3xl p-4 text-sm text-[var(--color-muted)]"
      >
        Loading order details...
      </div>
    ) : order ? (
      <OrderDetailSummary
        key="details"
        order={order}
        orderState={orderState}
        missingRequiredFields={missingRequiredFields}
        onMissingOrderInfoClick={handleMissingOrderInfoClick}
        onTrackingLinkCopy={handleTrackingLinkCopy}
      />
    ) : (
      <div
        key="details"
        className="admin-glass-panel rounded-3xl p-4 text-sm text-[var(--color-muted)]"
      >
        Order not found.
      </div>
    ),
    order ? <OrderDetailNotesTab key="notes" order={order} /> : null,
    order ? (
      <OrderDetailTimeWindows
        key="windows"
        order={order}
        headerRight={timeWindowHeaderAddon}
      />
    ) : null,
    <OrderDetailEventHistory
      key="history"
      orderId={orderServerId}
      focusEventId={payload?.focusEventId ?? null}
    />,
  ];

  if (isMobile) {
    return (
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--color-primary)]/5 [[data-theme=light]_&]:bg-surface-raised">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin">
          <OrderDetailHeaderMobile
            openOrderForm={openOrderForm}
            onClose={closeOrderDetail}
            onAdvanceOrderState={advanceDetailOrderState}
            order={order}
            headerBehavior={payload?.headerBehavior ?? null}
            contextRouteGroupId={payload?.routeGroupId ?? null}
          />

          <div className="flex w-full flex-col gap-5 bg-[var(--color-page)] pb-8 pt-3 [[data-theme=light]_&]:bg-transparent">
            <div className="px-3">
              <OrderDetailMobileSections
                key={`${order?.client_id ?? "empty"}:${initialCarouselIndex}`}
                initialIndex={initialCarouselIndex}
              >
                {sections}
              </OrderDetailMobileSections>
            </div>

            {isRefreshing && order ? (
              <div className="px-3 text-xs text-[var(--color-muted)]">
                Refreshing order details...
              </div>
            ) : null}

            {orderServerId !== null ? (
              <div className="flex w-full flex-col bg-[var(--color-muted)]/10 [[data-theme=light]_&]:bg-transparent">
                <ItemsOrderPreview
                  orderId={orderServerId}
                  expectedItemCount={order?.total_items ?? null}
                  itemsUpdatedAt={order?.items_updated_at ?? null}
                  stickyHeader
                />
              </div>
            ) : (
              <div className="admin-glass-panel mx-3 rounded-3xl p-4 text-xs text-[var(--color-muted)]">
                Items are available after the order has a server id.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--color-primary)]/5 [[data-theme=light]_&]:bg-surface-raised">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-[var(--color-primary)]/30" />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin">
        <OrderDetailHeader
          openOrderForm={openOrderForm}
          onClose={closeOrderDetail}
          onAdvanceOrderState={advanceDetailOrderState}
          order={order}
          headerBehavior={payload?.headerBehavior ?? null}
          contextRouteGroupId={payload?.routeGroupId ?? null}
        />

        <div className="flex w-full flex-col gap-6 bg-[var(--color-page)] pb-6 pt-3 [[data-theme=light]_&]:bg-transparent">
          <div className="flex flex-col gap-4 px-5 ">
            <SlideCarousel
              key={`${order?.client_id ?? "empty"}:${initialCarouselIndex}`}
              initialIndex={initialCarouselIndex}
            >
              {sections}
            </SlideCarousel>
          </div>

          {isRefreshing && order ? (
            <div className="px-5 pt-2 text-xs text-[var(--color-muted)]">
              Refreshing order details...
            </div>
          ) : null}

          {orderServerId !== null ? (
            <div className="flex w-full flex-col bg-[var(--color-muted)]/10 [[data-theme=light]_&]:bg-transparent">
              <ItemsOrderPreview
                orderId={orderServerId}
                expectedItemCount={order?.total_items ?? null}
                itemsUpdatedAt={order?.items_updated_at ?? null}
                stickyHeader
              />
            </div>
          ) : (
            <div className="admin-glass-panel mx-5 rounded-3xl p-4 text-xs text-[var(--color-muted)]">
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
