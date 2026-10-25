import { CloseIcon, OrderIcon, PlusIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import type {
  OrderQueryFilters,
} from "../../types/orderMeta";
import { SearchFilterBar } from "@/shared/searchBars";
import { useSectionPanel } from "@/shared/section-panel/SectionPanelContext";
import { type RefObject, useEffect, useMemo } from "react";
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu";
import { InfoHover } from "@/shared/layout/InfoHover";
import { ORDER_MAIN_HEADER_INFO } from "../../info/orderMainHeader.info";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { HeaderSlotPortal, HOME_HEADER_END_SLOT } from "@/shared/layout/headerSlot";
import {
  countActiveOrderFilters,
  draftFromOrderQueryFilters,
} from "../../domain/orderFilterPanel.domain";

type OrderMainHeaderProps = {
  onCreate: () => void;
  onEnterSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  isSelectionMode: boolean;
  applySearch: (input: string) => void;
  onOpenFilters: () => void;
  query: {
    q: string;
    filters: OrderQueryFilters;
  };
  actionStackRef?: RefObject<HTMLDivElement | null>;
  useFloatingActionStack?: boolean;
  isActionStackVisible?: boolean;
  isMobile: boolean;
  /** Width of the order panel; the header search matches it (desktop/iPad). */
  headerSearchWidth?: number | null;
};

type OrderHeaderActionsProps = Pick<OrderMainHeaderProps, 'onCreate' | 'onEnterSelectionMode' | 'onExitSelectionMode' | 'isSelectionMode'>;

function OrderHeaderActions({ onCreate, onEnterSelectionMode, onExitSelectionMode, isSelectionMode }: OrderHeaderActionsProps) {
  const menuOptions = [
    { label: "Auto create plans", action: () => {}, icon: "" },
    isSelectionMode
      ? { label: "Exit selection", action: onExitSelectionMode, icon: "" }
      : { label: "Selection mode", action: onEnterSelectionMode, icon: "" },
  ];
  return (
    <div className="flex shrink-0 items-center gap-2">
      <BasicButton key="order-main-create" params={{ variant: "primary", onClick: onCreate, ariaLabel: "Create order", className: "text-xs" }}>
        <PlusIcon className="mr-2 h-3 w-3 stroke-[var(--color-secondary)]" />Order
      </BasicButton>
      <ThreeDotMenu dotWidth={3} dotHeight={3} dotClassName="bg-[var(--color-muted)]" triggerClassName="touch-hit-area h-11 w-11 cursor-pointer rounded-full" options={menuOptions} />
    </div>
  );
}

export const OrderMainHeader = ({
  onCreate,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAllFiltered,
  onClearSelection,
  isSelectionMode,
  applySearch,
  onOpenFilters,
  query,
  actionStackRef,
  useFloatingActionStack = false,
  isActionStackVisible = true,
  isMobile,
  headerSearchWidth,
}: OrderMainHeaderProps) => {
  const { setHeader } = useSectionPanel();

  const activeFilterCount = useMemo(
    () => countActiveOrderFilters(draftFromOrderQueryFilters(query.filters)),
    [query.filters],
  );

  useEffect(() => {
    // Counts live at the top of the list (OrderListSummary), not here.
    const title = (
      <div className="flex items-center gap-2">
        <span>Orders</span>
        <InfoHover content={ORDER_MAIN_HEADER_INFO} />
      </div>
    );
    setHeader({
      title,
      icon: <OrderIcon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} fill-[var(--color-muted)]`} />,
      closeButton: false,
      ...(isMobile ? {} : { size: 'compact' as const, customHeaderButton: <OrderHeaderActions onCreate={onCreate} onEnterSelectionMode={onEnterSelectionMode} onExitSelectionMode={onExitSelectionMode} isSelectionMode={isSelectionMode} /> }),
    });
    return () => {
      setHeader(null);
    };
  }, [setHeader, isMobile, onCreate, isSelectionMode, onEnterSelectionMode, onExitSelectionMode]);

  // Active filters show only as the count on the filter button (user, D11).
  const searchAndFilters = (
    <div className={isMobile ? "flex gap-4 p-4 pb-3 max-h-[65px] bg-[var(--color-page)]" : "w-full"}>
      <div className="min-w-0 flex-1">
        <SearchFilterBar placeholder="Search orders..." applySearch={applySearch} onOpenFilters={onOpenFilters} activeFilterCount={activeFilterCount} searchValue={query.q} size={isMobile ? "default" : "compact"} />
      </div>
      {isMobile && <OrderHeaderActions onCreate={onCreate} onEnterSelectionMode={onEnterSelectionMode} onExitSelectionMode={onExitSelectionMode} isSelectionMode={isSelectionMode} />}
    </div>
  );

  return (
    <>
      {!isMobile && (
        <HeaderSlotPortal name={HOME_HEADER_END_SLOT}>
          <div
            className={cn("flex flex-col px-4", headerSearchWidth ? undefined : "w-[360px]")}
            style={headerSearchWidth ? { width: headerSearchWidth } : undefined}
          >
            {searchAndFilters}
          </div>
        </HeaderSlotPortal>
      )}
      <motion.div
        ref={actionStackRef}
        initial={false}
        animate={{
          opacity: useFloatingActionStack ? (isActionStackVisible ? 1 : 0) : 1,
          y: useFloatingActionStack ? (isActionStackVisible ? 0 : -18) : 0,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex flex-col",
          useFloatingActionStack ? "absolute inset-x-0 top-0 z-20" : undefined,
        )}
        style={{
          pointerEvents:
            !useFloatingActionStack || isActionStackVisible ? "auto" : "none",
        }}
      >
        {isMobile && searchAndFilters}
        {isSelectionMode && (
          <div className="flex w-full px-2 justify-center gap-3 text-xs ">
            <BasicButton
              params={{
                variant: "ghost",
                onClick: onClearSelection,
                className: " hover:bg-red-100 text-red-400",
              }}
            >
              Clear selection
            </BasicButton>

            <BasicButton
              params={{
                variant: "ghost",
                onClick: onSelectAllFiltered,
                className: " hover:bg-blue-100 text-blue-400",
              }}
            >
              Select all filtered
            </BasicButton>

            <BasicButton
              params={{
                variant: "ghost",
                onClick: onExitSelectionMode,
              }}
            >
              <div className="text-underline flex gap-2 text-[var(--color-muted)] ml-auto">
                <CloseIcon className="h-3 w-3" /> Exit selection
              </div>
            </BasicButton>
          </div>
        )}
      </motion.div>
    </>
  );
};
