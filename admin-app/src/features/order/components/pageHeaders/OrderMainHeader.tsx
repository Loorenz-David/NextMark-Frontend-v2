import { CloseIcon, OrderIcon, PlusIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import type {
  OrderQueryFilters,
  OrderStats,
} from "../../types/orderMeta";
import { ActiveFilterPills, SearchFilterBar } from "@/shared/searchBars";
import { useSectionPanel } from "@/shared/section-panel/SectionPanelContext";
import { type RefObject, useEffect, useMemo } from "react";
import { pluralLabel } from "@shared-utils";
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu";
import { InfoHover } from "@/shared/layout/InfoHover";
import { ORDER_MAIN_HEADER_INFO } from "../../info/orderMainHeader.info";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatOrderFilterPill } from "../../domain/orderFilterLabelFormatter";
import {
  countActiveOrderFilters,
  draftFromOrderQueryFilters,
  isOrderFilterPanelKey,
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
  onRemoveFilter: (key: string, value?: unknown) => void;
  orderStats?: OrderStats;
  query: {
    q: string;
    filters: OrderQueryFilters;
  };
  actionStackRef?: RefObject<HTMLDivElement | null>;
  useFloatingActionStack?: boolean;
  isActionStackVisible?: boolean;
};

export const OrderMainHeader = ({
  onCreate,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAllFiltered,
  onClearSelection,
  isSelectionMode,
  applySearch,
  onOpenFilters,
  onRemoveFilter,
  query,
  orderStats,
  actionStackRef,
  useFloatingActionStack = false,
  isActionStackVisible = true,
}: OrderMainHeaderProps) => {
  const { setHeader } = useSectionPanel();

  // Only the keys the filter panel owns become pills; search columns, sort and
  // cursors stay invisible.
  const pillFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(query.filters).filter(([key]) => isOrderFilterPanelKey(key)),
      ),
    [query.filters],
  );
  const activeFilterCount = useMemo(
    () => countActiveOrderFilters(draftFromOrderQueryFilters(query.filters)),
    [query.filters],
  );

  useEffect(() => {
    const ordersCount = orderStats?.orders?.total ?? 0;
    const itemsCount = orderStats?.items?.total ?? 0;

    const title = (
      <div>
        <div className="flex items-center gap-2">
          <span>Orders</span>
          <InfoHover content={ORDER_MAIN_HEADER_INFO} />
        </div>
        <span className="text-xs flex text-[var(--color-muted)] font-normal">
          {ordersCount} {pluralLabel("order", ordersCount)} • {itemsCount}{" "}
          {pluralLabel("item", itemsCount)}
        </span>
      </div>
    );
    setHeader({
      title,
      icon: <OrderIcon className="h-6 w-6 fill-[var(--color-muted)]" />,
      closeButton: false,
    });
    return () => {
      setHeader(null);
    };
  }, [orderStats, setHeader]);

  return (
    <>
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
        <div className="flex gap-4 p-4 pb-3 max-h-[65px] bg-[var(--color-page)]">
          <SearchFilterBar
            placeholder="Search orders..."
            applySearch={applySearch}
            onOpenFilters={onOpenFilters}
            activeFilterCount={activeFilterCount}
            searchValue={query.q}
          />

          <BasicButton
            key="order-main-create"
            params={{
              variant: "primary",
              onClick: onCreate,
              ariaLabel: "Create order",
              className: "text-xs ",
            }}
          >
            <PlusIcon className="mr-2 h-3 w-3 stroke-[var(--color-secondary)]" />
            Order
          </BasicButton>
          <ThreeDotMenu
            dotWidth={3}
            dotHeight={3}
            dotClassName={"bg-[var(--color-muted)]"}
            triggerClassName={
              " p-2 w-5 rounded-full    ml-auto  cursor-pointer"
            }
            options={[
              { label: "Auto create plans", action: () => {}, icon: "" },
              {
                ...(isSelectionMode
                  ? {
                      label: "Exit selection",
                      action: onExitSelectionMode,
                      icon: "",
                    }
                  : {
                      label: "Selection mode",
                      action: onEnterSelectionMode,
                      icon: "",
                    }),
              },
            ]}
          />
        </div>
        <div className="flex w-full px-2">
          <ActiveFilterPills
            className="px-4"
            filters={pillFilters}
            removeFilter={onRemoveFilter}
            formatFilterLabel={formatOrderFilterPill}
          />
        </div>
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
