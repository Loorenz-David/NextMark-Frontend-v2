import { useState } from "react";

type HomeDesktopLayoutParams = {
  openSectionsCount?: number;
};

export type DesktopPlanViewMode = "rail" | "split";

const DESKTOP_PLAN_VIEW_MODE_KEY = "home.desktop.planViewMode";
const DEFAULT_VIEW_MODE: DesktopPlanViewMode = "rail";
const SPLIT_RATIO = 50;

const resolveInitialViewMode = (): DesktopPlanViewMode => {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW_MODE;
  }

  const stored = window.localStorage.getItem(DESKTOP_PLAN_VIEW_MODE_KEY);
  if (stored === "rail" || stored === "split") {
    return stored;
  }

  return DEFAULT_VIEW_MODE;
};

export function useHomeDesktopLayout({
  openSectionsCount = 0,
}: HomeDesktopLayoutParams) {
  const [isPlanOpen, setIsPlanOpen] = useState(true);
  const [viewMode, setViewModeState] = useState<DesktopPlanViewMode>(() =>
    resolveInitialViewMode(),
  );

  const closePlan = () => {
    setIsPlanOpen(false);
  };
  const openPlan = () => {
    setIsPlanOpen(true);
  };

  const canTogglePlan = true;

  const isPlanVisible = isPlanOpen;

  const PLAN_WIDTH = 450;
  const BASE_WIDTH = 450;
  const ORDER_OVERLAY_WIDTH = 550;
  const OVERLAY_WIDTH = 450;

  const hasOverlay = openSectionsCount > 0;
  const isRailView = viewMode === "rail";
  const planColumnWidth = isRailView && isPlanVisible ? PLAN_WIDTH : 0;
  const mapRowHeight =
    viewMode === "split" ? (isPlanVisible ? SPLIT_RATIO : 100) : 100;
  const planRowHeight =
    viewMode === "split" ? (isPlanVisible ? 100 - SPLIT_RATIO : 0) : 0;

  const setViewMode = (mode: DesktopPlanViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DESKTOP_PLAN_VIEW_MODE_KEY, mode);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "rail" ? "split" : "rail");
  };

  return {
    isPlanVisible,
    canTogglePlan,
    viewMode,
    setViewMode,
    toggleViewMode,
    togglePlan: () => {
      setIsPlanOpen((prev) => !prev);
    },
    openPlan,
    closePlan,
    // layout values (tune later)
    mapFlex: 1,
    baseWidth: BASE_WIDTH,
    orderOverlayWidth: ORDER_OVERLAY_WIDTH,
    planWidth: PLAN_WIDTH,
    planColumnWidth,
    mapRowHeight,
    planRowHeight,
    overlayWidth: OVERLAY_WIDTH,
    hasOverlay,
  };
}
