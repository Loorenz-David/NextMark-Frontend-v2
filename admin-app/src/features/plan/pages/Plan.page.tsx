import { useCallback, useEffect, useRef, useState } from "react";

import { useVisibleRoutePlans } from "../store/useRoutePlan.selector";

import { PlanList, PlanLoadingList, PlanMainHeader } from "../components";
import { usePlanHeaderAction } from "../actions/usePlanActions";
import { useRoutePlanListStats } from "../store/routePlanList.selector";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { usePlanPaginationController } from "../hooks/usePlanPaginationController";
import type { PlanDateFilterPayload } from "../components/planDateFilter";
import type { PlanQueryFilters } from "../types/planMeta";

type RoutePlanPageProps = {
  onRequestClose?: () => void;
  showCloseButton?: boolean;
};

const mergePlanQuery = (
  previous: PlanQueryFilters | undefined,
  next: PlanQueryFilters,
): PlanQueryFilters => {
  const merged: PlanQueryFilters = {
    ...previous,
    ...next,
  };

  merged.filters = {
    ...(typeof previous?.filters === "object" &&
    previous.filters &&
    !Array.isArray(previous.filters)
      ? previous.filters
      : {}),
    ...(typeof next.filters === "object" &&
    next.filters &&
    !Array.isArray(next.filters)
      ? next.filters
      : {}),
  };

  return merged;
};

const queryEquals = (
  left: PlanQueryFilters | undefined,
  right: PlanQueryFilters | undefined,
): boolean => {
  return JSON.stringify(left ?? {}) === JSON.stringify(right ?? {});
};

export const RoutePlanPage = ({
  onRequestClose,
  showCloseButton,
}: RoutePlanPageProps) => {
  const [activeQuery, setActiveQuery] = useState<PlanQueryFilters | undefined>(
    undefined,
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);
  const plans = useVisibleRoutePlans();
  const plansStats = useRoutePlanListStats();
  const planActions = usePlanHeaderAction();
  const handleFilterSelection = useCallback(
    (payload: PlanDateFilterPayload) => {
      const nextFilters = {
        mode: payload.selection.mode,
        ...payload.filters,
      };

      setActiveQuery((previous) => {
        const candidate = mergePlanQuery(previous, nextFilters);
        return queryEquals(previous, candidate) ? previous : candidate;
      });
    },
    [],
  );

  const handleFiltersChange = useCallback((filters: PlanQueryFilters) => {
    setActiveQuery((previous) => {
      const candidate = mergePlanQuery(previous, filters);
      return queryEquals(previous, candidate) ? previous : candidate;
    });
  }, []);

  const {
    hasMore,
    isLoadingPage,
    isReplacingList,
    loadFirstPage,
    loadNextPage,
  } = usePlanPaginationController({
    query: activeQuery,
    scrollToTop: handleScrollToTop,
  });
  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const isListLoading = isReplacingList;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PlanMainHeader
        onCreate={planActions.onCreatePlan}
        onRequestClose={onRequestClose}
        showCloseButton={showCloseButton}
        planStats={plansStats}
        applySearch={() => {}}
        applyFilters={handleFiltersChange}
        applyFilterSelection={handleFilterSelection}
      />
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto scroll-thin"
      >
        {isListLoading ? (
          <PlanLoadingList count={4} />
        ) : (
          <PlanList plans={plans} droppable={true} />
        )}
        {!isListLoading ? (
          <div className="flex justify-center px-5 pb-8 pt-2">
            <BasicButton
              params={{
                onClick: () => {
                  void loadNextPage();
                },
                disabled: isLoadingPage || !hasMore,
                variant: "secondary",
                ariaLabel: "Load next page of plans",
              }}
            >
              {isLoadingPage
                ? "Loading…"
                : hasMore
                  ? "Show more"
                  : "No more plans"}
            </BasicButton>
          </div>
        ) : null}
      </div>
    </div>
  );
};
