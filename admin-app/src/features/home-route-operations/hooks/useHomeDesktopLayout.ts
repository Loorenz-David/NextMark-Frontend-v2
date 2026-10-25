import { useEffect, useState } from "react";

import { useViewport } from "@/app/viewport";
import { usePlanContainerView } from "@/features/plan";

import {
  resolveHomeDesktopTracks,
  type DesktopPlanViewMode,
} from "../domain/homeDesktopLayout.domain";
import { resolveOrderPanelWidth } from "../domain/orderPanelWidth";
import { resolveRoutePlanPanelWidth } from "../domain/routePlanPanelWidth";
import {
  useDesktopMapActions,
  useIsDesktopMapVisible,
} from "../store/homeDesktopLayout.store";

export type { DesktopPlanViewMode } from "../domain/homeDesktopLayout.domain";

type HomeDesktopLayoutParams = {
  openSectionsCount?: number;
  isOrderOverlayOpen?: boolean;
  /** The open plan is local delivery, which uses the narrower route plan panel. */
  isRoutePlanWorkspace?: boolean;
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
  isRoutePlanWorkspace = false,
}: HomeDesktopLayoutParams) {
  const { sizeClass, isTablet } = useViewport();
  const isMapVisible = useIsDesktopMapVisible(isTablet);
  const [isPlanOpen, setIsPlanOpen] = useState(() => !isTablet || !isMapVisible);
  const [viewMode, setViewModeState] = useState<DesktopPlanViewMode>(() =>
    resolveInitialViewMode(),
  );
  const { showMap, hideMap } = useDesktopMapActions();

  useEffect(() => {
    if (isTablet && isMapVisible && isPlanOpen) {
      setIsPlanOpen(false);
    }
  }, [isTablet, isMapVisible, isPlanOpen]);

  const isPlanVisible = isPlanOpen;

  const BASE_WIDTH = resolveOrderPanelWidth(isTablet ? "tablet" : "desktop");
  const ORDER_OVERLAY_WIDTH = isRoutePlanWorkspace
    ? resolveRoutePlanPanelWidth(isTablet ? "tablet" : "desktop", BASE_WIDTH)
    : isTablet
      ? 560
      : 550;
  const OVERLAY_WIDTH = isTablet ? 560 : 450;

  const hasOverlay = openSectionsCount > 0;
  const railColumnWidth = isOrderOverlayOpen ? ORDER_OVERLAY_WIDTH : BASE_WIDTH;
  const planContainerView = usePlanContainerView();
  const tracks = resolveHomeDesktopTracks({
    sizeClass,
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
    if (isTablet) hideMap();
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
      if (isTablet) setIsPlanOpen(false);
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
    planWidth: BASE_WIDTH,
    planColumnWidth: tracks.planColumnWidth,
    mapRowHeight: tracks.mapRowHeight,
    planRowHeight: tracks.planRowHeight,
    overlayWidth: OVERLAY_WIDTH,
    hasOverlay,
  };
}
