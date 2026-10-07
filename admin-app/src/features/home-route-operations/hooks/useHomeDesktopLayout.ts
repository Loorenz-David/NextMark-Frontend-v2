import { useState } from "react";

import { usePlanContainerView } from "@/features/plan";

import {
  DESKTOP_PLAN_WIDTH,
  resolveHomeDesktopTracks,
  type DesktopPlanViewMode,
} from "../domain/homeDesktopLayout.domain";
import {
  useDesktopMapActions,
  useIsDesktopMapVisible,
} from "../store/homeDesktopLayout.store";

export type { DesktopPlanViewMode } from "../domain/homeDesktopLayout.domain";

type HomeDesktopLayoutParams = {
  openSectionsCount?: number;
  isOrderOverlayOpen?: boolean;
};

const DESKTOP_PLAN_VIEW_MODE_KEY = "home.desktop.planViewMode";
const DEFAULT_VIEW_MODE: DesktopPlanViewMode = "rail";

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
  isOrderOverlayOpen = false,
}: HomeDesktopLayoutParams) {
  const [isPlanOpen, setIsPlanOpen] = useState(true);
  const [viewMode, setViewModeState] = useState<DesktopPlanViewMode>(() =>
    resolveInitialViewMode(),
  );
  const isMapVisible = useIsDesktopMapVisible();
  const { showMap, hideMap } = useDesktopMapActions();

  const isPlanVisible = isPlanOpen;

  const BASE_WIDTH = 450;
  const ORDER_OVERLAY_WIDTH = 550;
  const OVERLAY_WIDTH = 450;

  const hasOverlay = openSectionsCount > 0;
  const railColumnWidth = isOrderOverlayOpen ? ORDER_OVERLAY_WIDTH : BASE_WIDTH;
  const planContainerView = usePlanContainerView();
  const tracks = resolveHomeDesktopTracks({
    viewMode,
    isPlanVisible,
    isMapVisible,
    planContainerView,
    railColumnWidth,
  });

  // The two center panels can never be folded at once; the guards below are
  // enforced in the mutations because the plan's own close button calls
  // closePlan directly rather than going through the toggle slot.
  const closePlan = () => {
    if (!isMapVisible) return;
    setIsPlanOpen(false);
  };
  const openPlan = () => {
    setIsPlanOpen(true);
  };
  const togglePlan = () => {
    if (isPlanOpen) {
      closePlan();
      return;
    }
    openPlan();
  };
  const toggleMap = () => {
    if (!isMapVisible) {
      showMap();
      return;
    }
    if (isPlanVisible) {
      hideMap();
    }
  };

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
    canTogglePlan: tracks.canTogglePlan,
    isMapVisible,
    canToggleMap: tracks.canToggleMap,
    viewMode,
    setViewMode,
    toggleViewMode,
    togglePlan,
    openPlan,
    closePlan,
    toggleMap,
    // layout values (tune later)
    mapFlex: 1,
    baseWidth: BASE_WIDTH,
    orderOverlayWidth: ORDER_OVERLAY_WIDTH,
    planWidth: DESKTOP_PLAN_WIDTH,
    planColumnWidth: tracks.planColumnWidth,
    mapRowHeight: tracks.mapRowHeight,
    planRowHeight: tracks.planRowHeight,
    overlayWidth: OVERLAY_WIDTH,
    hasOverlay,
  };
}
