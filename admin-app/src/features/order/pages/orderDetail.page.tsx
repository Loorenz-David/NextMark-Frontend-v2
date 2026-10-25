import { useMobile } from "@/app/viewport";

import type { StackComponentProps } from "@/shared/stack-manager/types";

import { ItemsOrderPreview } from "../item";

import { OrderDetailSummary } from "../components/OrderDetailSummary";
import { OrderDetailNotesTab } from "../components/OrderDetailNotesTab";
import { OrderDetailEventHistory } from "../components/OrderDetailEventHistory";
import { OrderDetailHeader } from "../components/pageHeaders/OrderDetailHeader";
import { OrderDetailHeaderMobile } from "../components/pageHeaders/OrderDetailHeaderMobile";
import { OrderDetailSections } from "../components/OrderDetailSections";
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

  // One element per section, in switcher order (details, notes, windows,
  // history). Kept as an array, not a fragment: the switcher counts
  // children to know how many sections exist.
  const sections = [
    isRefreshing && !order ? (
      <div
        key="details"
        className="px-4 py-6 text-sm text-[var(--color-muted)]"
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
        className="px-4 py-6 text-sm text-[var(--color-muted)]"
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

  // Items come first; the section cards follow and grow with their
  // content, so the page is the only scroll area. Cards run the full
  // width of the panel; only loose text keeps a gutter.
  const gutterClassName = isMobile ? "px-3" : "px-5";

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--color-primary)]/5 [[data-theme=light]_&]:bg-surface-raised">
      {!isMobile ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-[var(--color-primary)]/30" />
      ) : null}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin">
        {isMobile ? (
          <OrderDetailHeaderMobile
            openOrderForm={openOrderForm}
            onClose={closeOrderDetail}
            onAdvanceOrderState={advanceDetailOrderState}
            order={order}
            headerBehavior={payload?.headerBehavior ?? null}
            contextRouteGroupId={payload?.routeGroupId ?? null}
          />
        ) : (
          <OrderDetailHeader
            openOrderForm={openOrderForm}
            onClose={closeOrderDetail}
            onAdvanceOrderState={advanceDetailOrderState}
            order={order}
            headerBehavior={payload?.headerBehavior ?? null}
            contextRouteGroupId={payload?.routeGroupId ?? null}
          />
        )}

        <div
          className={`flex w-full flex-col bg-[var(--color-page)] pt-3 [[data-theme=light]_&]:bg-transparent ${
            isMobile ? "gap-5 pb-8" : "gap-6 pb-6"
          }`}
        >
          {orderServerId !== null ? (
            <ItemsOrderPreview
              orderId={orderServerId}
              expectedItemCount={order?.total_items ?? null}
              itemsUpdatedAt={order?.items_updated_at ?? null}
              detailLayout
            />
          ) : (
            <div className="admin-glass-panel rounded-3xl p-4 text-xs text-[var(--color-muted)]">
              Items are available after the order has a server id.
            </div>
          )}

          <OrderDetailSections
            key={`${order?.client_id ?? "empty"}:${initialCarouselIndex}`}
            initialIndex={initialCarouselIndex}
          >
            {sections}
          </OrderDetailSections>

          {isRefreshing && order ? (
            <div className={`${gutterClassName} text-xs text-[var(--color-muted)]`}>
              Refreshing order details...
            </div>
          ) : null}
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
