import { useCallback, useEffect, useMemo, useRef } from "react";

import { useVehicles } from "@/features/infrastructure/vehicle";
import { usePlanQueries } from "@/features/plan/flows/planQueries.flow";
import {
  useOpenCreatePlanFormAction,
  usePlanHeaderAction,
} from "@/features/plan/actions/usePlanActions";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import { useRoutePlanStore } from "@/features/plan/store/routePlan.slice";

import {
  buildMonthGrid,
  computeCalendarRangeStats,
  formatMonthTitle,
  getAssignedVehicleVolumeCapacityCm3,
  getGridRangeKeys,
  getTodayDayKey,
  groupPlansByDay,
  type CalendarDayKey,
} from "../domain/planCalendar.domain";
import { hydrateCalendarVehicleAssignments } from "../flows/hydrateCalendarVehicleAssignments.flow";
import { usePlanCalendarStore } from "../store/planCalendar.store";

const CALENDAR_RANGE_FETCH_LIMIT = 300;

export const usePlanCalendarController = () => {
  const { fetchPlansPage } = usePlanQueries();
  const { openPlanSection } = usePlanHeaderAction();
  const openCreatePlanForm = useOpenCreatePlanFormAction();

  const monthCursor = usePlanCalendarStore((state) => state.monthCursor);
  const isFetchingRange = usePlanCalendarStore(
    (state) => state.isFetchingRange,
  );
  const stepMonth = usePlanCalendarStore((state) => state.stepMonth);
  const goToToday = usePlanCalendarStore((state) => state.goToToday);
  const setIsFetchingRange = usePlanCalendarStore(
    (state) => state.setIsFetchingRange,
  );
  const vehicleAssignmentsByPlanId = usePlanCalendarStore(
    (state) => state.vehicleAssignmentsByPlanId,
  );
  const vehicles = useVehicles();

  const todayKey = getTodayDayKey();

  const cells = useMemo(
    () => buildMonthGrid(monthCursor, todayKey),
    [monthCursor, todayKey],
  );

  const range = useMemo(() => getGridRangeKeys(cells), [cells]);
  const rangeKey = range ? `${range.startKey}:${range.endKey}` : null;

  // Fetch every plan covering the visible range into the entity store.
  const activeFetchRangeKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!rangeKey || !range) return;
    let cancelled = false;
    activeFetchRangeKeyRef.current = rangeKey;
    setIsFetchingRange(true);

    void fetchPlansPage({
      mode: "range",
      start_date: range.startKey,
      end_date: range.endKey,
      sort: "date_asc",
      limit: CALENDAR_RANGE_FETCH_LIMIT,
    }).finally(() => {
      if (cancelled || activeFetchRangeKeyRef.current !== rangeKey) return;
      setIsFetchingRange(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey, fetchPlansPage, setIsFetchingRange]);

  // byClientId has a stable identity between writes, making it a safe
  // subscription target; the visible buckets derive from it.
  const plansByClientId = useRoutePlanStore((state) => state.byClientId);

  const plansByDay = useMemo(() => {
    if (!range) return new Map<CalendarDayKey, DeliveryPlan[]>();
    return groupPlansByDay(
      Object.values(plansByClientId),
      range.startKey,
      range.endKey,
    );
  }, [plansByClientId, range]);

  const visiblePlanIds = useMemo(
    () =>
      Array.from(
        new Set(
          Array.from(plansByDay.values())
            .flat()
            .flatMap((plan) =>
              typeof plan.id === "number" ? [plan.id] : [],
            ),
        ),
      ).sort((left, right) => left - right),
    [plansByDay],
  );
  const visiblePlanIdsKey = visiblePlanIds.join(",");

  useEffect(() => {
    if (visiblePlanIds.length === 0) return;
    const controller = new AbortController();

    void hydrateCalendarVehicleAssignments(
      visiblePlanIds,
      controller.signal,
    );

    return () => controller.abort();
    // The stable scalar key prevents a reload when only plan metrics change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePlanIdsKey]);

  const capacityByVehicleId = useMemo(
    () =>
      new Map(
        vehicles.flatMap((vehicle) =>
          typeof vehicle.id === "number"
            ? [[vehicle.id, vehicle.max_volume_load_cm3 ?? null] as const]
            : [],
        ),
      ),
    [vehicles],
  );

  const volumeCapacityByPlanId = useMemo(() => {
    const capacities: Record<number, number | null> = {};

    visiblePlanIds.forEach((planId) => {
      const assignment = vehicleAssignmentsByPlanId[planId];
      capacities[planId] =
        assignment?.status === "ready"
          ? getAssignedVehicleVolumeCapacityCm3(
              assignment.vehicleIds,
              capacityByVehicleId,
            )
          : null;
    });

    return capacities;
  }, [
    capacityByVehicleId,
    vehicleAssignmentsByPlanId,
    visiblePlanIds,
  ]);

  const stats = useMemo(() => {
    const inMonthKeys = new Set(
      cells.filter((cell) => cell.inMonth).map((cell) => cell.dateKey),
    );
    return computeCalendarRangeStats(plansByDay, inMonthKeys);
  }, [cells, plansByDay]);

  const title = formatMonthTitle(monthCursor);

  const stepPrevious = useCallback(() => {
    stepMonth(-1);
  }, [stepMonth]);

  const stepNext = useCallback(() => {
    stepMonth(1);
  }, [stepMonth]);

  const openPlan = useCallback(
    (plan: DeliveryPlan) => {
      openPlanSection(plan);
    },
    [openPlanSection],
  );

  const openCreatePlanFormForDate = useCallback(
    (dateKey: CalendarDayKey) => {
      openCreatePlanForm({ initialStartDate: dateKey });
    },
    [openCreatePlanForm],
  );

  return {
    cells,
    plansByDay,
    volumeCapacityByPlanId,
    stats,
    title,
    todayKey,
    isFetchingRange,
    stepPrevious,
    stepNext,
    goToToday,
    openPlan,
    openCreatePlanFormForDate,
  };
};
