import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { useScrollHideActionBar } from "@/shared/hooks/useScrollHideActionBar";
import { OrderLoadingList } from "@/shared/loadingCards/order";

import { OrderMainHeader } from "../components/pageHeaders/OrderMainHeader";
import { OrderList } from "../components/lists/OrderList";
import { OrderProvider } from "../context/OrderProvider";
import { useOrderContext } from "../context/OrderContext";
import type { Order } from "../types/order";

const OrderMainContent = ({
  scrollContainerRef,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}) => {
  const {
    orders,
    orderActions,
    orderSelectionActions,
    isSelectionMode,
    isOrderSelected,
    query,
    orderStats,
    hoveredClientId,
    handleOrderRowMouseEnter,
    handleOrderRowMouseLeave,
    hasMorePages,
    isInitialLoading,
    isLoadingNextPage,
    loadNextPage,
  } = useOrderContext();
  const actionStackRef = useRef<HTMLDivElement | null>(null);
  const [actionStackHeight, setActionStackHeight] = useState(0);

  useEffect(() => {
    const element = actionStackRef.current;
    if (!element) {
      setActionStackHeight(0);
      return;
    }

    const updateHeight = () => {
      const nextHeight = element.getBoundingClientRect().height;
      setActionStackHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [query.filters, isSelectionMode]);

  const {
    isActionBarVisible,
    actionBarReservedHeight,
    isDesktopActionBarBehaviorEnabled,
    handleScroll,
  } = useScrollHideActionBar({
    enabled: true,
    expandedHeight: actionStackHeight,
  });

  const handleOpenOrder = (order: Order) => {
    orderActions.openOrderDetail(
      {
        clientId: order.client_id,
        mode: "view",
        openSource: "card",
        headerBehavior: "order-main-context",
      },
      {
        pageClass: "bg-[var(--color-muted)]/10 ",
        borderLeft: "rgb(var(--color-light-blue-r),0.7)",
      },
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--color-primary)]/5">
      <OrderMainHeader
        onCreate={() => orderActions.openOrderForm({ mode: "create" })}
        onEnterSelectionMode={orderSelectionActions.handleEnterSelectionMode}
        onExitSelectionMode={orderSelectionActions.handleExitSelectionMode}
        onSelectAllFiltered={orderSelectionActions.handleSelectAllFiltered}
        onClearSelection={orderSelectionActions.handleClearSelection}
        isSelectionMode={isSelectionMode}
        applySearch={orderActions.applySearch}
        applyFilters={orderActions.applyFilters}
        openPopupFilter={orderActions.openPopupFilter}
        query={query}
        updateFilters={orderActions.updateFilters}
        deleteFilter={orderActions.deleteFilter}
        orderStats={orderStats}
        actionStackRef={actionStackRef}
        useFloatingActionStack={isDesktopActionBarBehaviorEnabled}
        isActionStackVisible={isActionBarVisible}
      />
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-thin"
        onScroll={handleScroll}
      >
        <div
          style={{
            paddingTop: isDesktopActionBarBehaviorEnabled
              ? `${actionBarReservedHeight}px`
              : undefined,
            transition: "padding-top 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {isInitialLoading ? (
            <OrderLoadingList variant="orderMain" count={6} />
          ) : (
            <OrderList
              orders={orders}
              scrollContainerRef={scrollContainerRef}
              isSelectionMode={isSelectionMode}
              isOrderSelected={isOrderSelected}
              onToggleSelection={
                orderSelectionActions.handleToggleOrderSelection
              }
              onOpenOrder={handleOpenOrder}
              onArchive={orderActions.handleArchiveOrder}
              onUnarchive={orderActions.handleUnarchiveOrder}
              hoveredClientId={hoveredClientId}
              onOrderMouseEnter={handleOrderRowMouseEnter}
              onOrderMouseLeave={handleOrderRowMouseLeave}
            />
          )}
        </div>
      </div>
      {!isInitialLoading && (isLoadingNextPage || hasMorePages) && (
        <div className="flex justify-center  px-4 pb-4 pt-3">
          <BasicButton
            params={{
              onClick: () => {
                void loadNextPage();
              },
              disabled: isLoadingNextPage || !hasMorePages,
              variant: "secondary",
              ariaLabel: "Load next page of orders",
            }}
          >
            {isLoadingNextPage ? "Loading…" : "Show more"}
          </BasicButton>
        </div>
      )}
    </div>
  );
};

export const OrderMainPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <OrderProvider scrollContainerRef={scrollContainerRef}>
      <OrderMainContent scrollContainerRef={scrollContainerRef} />
    </OrderProvider>
  );
};
