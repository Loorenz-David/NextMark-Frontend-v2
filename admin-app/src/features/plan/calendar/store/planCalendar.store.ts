import { create } from "zustand";

import type {
  CalendarMonthCursor,
  CalendarDayKey,
} from "../domain/planCalendar.domain";
import {
  getMonthCursorForDayKey,
  getTodayDayKey,
  stepMonthCursor,
} from "../domain/planCalendar.domain";

/** How the center plan container renders its plans. */
export type PlanContainerView = "calendar" | "list";

export type CalendarPlanVehicleAssignment = {
  vehicleIds: Array<number | null>;
  status: "loading" | "ready" | "failure";
};

type PlanCalendarState = {
  containerView: PlanContainerView;
  monthCursor: CalendarMonthCursor;
  /** Day whose plans overlay is held open by an in-flight order drag. */
  dragOverlayDateKey: CalendarDayKey | null;
  isFetchingRange: boolean;
  vehicleAssignmentsByPlanId: Record<
    number,
    CalendarPlanVehicleAssignment
  >;
  setContainerView: (view: PlanContainerView) => void;
  stepMonth: (delta: number) => void;
  goToToday: () => void;
  setDragOverlayDateKey: (dateKey: CalendarDayKey | null) => void;
  setIsFetchingRange: (isFetching: boolean) => void;
  setPlanVehicleAssignmentLoading: (planId: number) => void;
  setPlanVehicleAssignmentReady: (
    planId: number,
    vehicleIds: Array<number | null>,
  ) => void;
  setPlanVehicleAssignmentFailure: (planId: number) => void;
};

export const usePlanCalendarStore = create<PlanCalendarState>((set) => ({
  containerView: "calendar",
  monthCursor: getMonthCursorForDayKey(getTodayDayKey()),
  dragOverlayDateKey: null,
  isFetchingRange: false,
  vehicleAssignmentsByPlanId: {},
  setContainerView: (view) => set({ containerView: view }),
  stepMonth: (delta) =>
    set((state) => ({ monthCursor: stepMonthCursor(state.monthCursor, delta) })),
  goToToday: () =>
    set({ monthCursor: getMonthCursorForDayKey(getTodayDayKey()) }),
  setDragOverlayDateKey: (dateKey) =>
    set((state) =>
      state.dragOverlayDateKey === dateKey
        ? state
        : { dragOverlayDateKey: dateKey },
    ),
  setIsFetchingRange: (isFetching) => set({ isFetchingRange: isFetching }),
  setPlanVehicleAssignmentLoading: (planId) =>
    set((state) => ({
      vehicleAssignmentsByPlanId: {
        ...state.vehicleAssignmentsByPlanId,
        [planId]: { vehicleIds: [], status: "loading" },
      },
    })),
  setPlanVehicleAssignmentReady: (planId, vehicleIds) =>
    set((state) => ({
      vehicleAssignmentsByPlanId: {
        ...state.vehicleAssignmentsByPlanId,
        [planId]: { vehicleIds, status: "ready" },
      },
    })),
  setPlanVehicleAssignmentFailure: (planId) =>
    set((state) => ({
      vehicleAssignmentsByPlanId: {
        ...state.vehicleAssignmentsByPlanId,
        [planId]: { vehicleIds: [], status: "failure" },
      },
    })),
}));

/** The active center-container view; consumed by the desktop layout to size the plan column. */
export const usePlanContainerView = (): PlanContainerView =>
  usePlanCalendarStore((state) => state.containerView);
