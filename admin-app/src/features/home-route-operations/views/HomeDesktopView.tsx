import { useCallback, useRef, useEffect, type CSSProperties } from "react";
import { BasicButton } from "@/shared/buttons/BasicButton";
import {
  useSectionManager,
  useMapManager,
} from "@/shared/resource-manager/useResourceManager";

import { ChevronDownIcon } from "@/assets/icons";

import { OrderPage } from "@/features/order/pages/order.page";
import { OrderMapOverlay } from "@/features/order/components/OrderMapOverlay";
import { RouteGroupMapOverlay } from "@/features/plan/routeGroup/components";
import { ZoneMapOverlay } from "@/features/zone/components/ZoneMapOverlay";
import { RouteGroupWorkspaceRuntime } from "@/features/plan/routeGroup/providers/RouteGroupWorkspaceRuntime";
import { useBaseControlls } from "@/shared/resource-manager/useResourceManager";
import { useMapSelectionModeGuardFlow } from "@/features/home-route-operations/flows/mapSelectionModeGuard.flow";
import { useHomeDesktopRailSettleFlow } from "@/features/home-route-operations/flows/homeDesktopRailSettle.flow";
import { useHomeDesktopDerivedStateFlow } from "@/features/home-route-operations/flows/homeDesktopDerivedState.flow";
import { RouteGroupsPage } from "@/features/plan/routeGroup/pages/RouteGroups.page";
import { useOrderSelectionMode } from "@/features/order/store/orderSelectionHooks.store";
import { useResourceManager } from "@/shared/resource-manager/useResourceManager";

import { HomeDesktopLayout } from "../layout/HomeDesktopLayout";
import { useHomeDesktopLayout } from "../hooks/useHomeDesktopLayout";
import { SectionManagerHost } from "../components/SectionManagerHost";
import type { PayloadBase } from "../types/types";

import { SectionPanel } from "../../../shared/section-panel/SectionPanel";
import { PlanDesktopShell } from "@/features/plan/views/PlanDesktopShell";

const SAFE_GUTTER = 24;
const DEFAULT_VIEWPORT_INSETS = {
  top: SAFE_GUTTER,
  right: SAFE_GUTTER,
  bottom: SAFE_GUTTER,
  left: SAFE_GUTTER,
};

const MAP_CONTAINER_STYLE: CSSProperties = {
  height: "100%",
  width: "100%",
  position: "absolute",
  zIndex: 0,
  top: "0",
  left: "0",
};

const PLAN_TOGGLE_BUTTON_STYLE: CSSProperties = {
  padding: "29px 6px",
  backgroundColor: "rgba(15, 23, 25, 0.78)",
  borderRadius: "10px 0 0 10px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 14px 32px rgba(0, 0, 0, 0.18)",
  backdropFilter: "blur(18px) saturate(120%)",
  WebkitBackdropFilter: "blur(18px) saturate(120%)",
};
const PLAN_TOGGLE_BUTTON_SPLIT_STYLE: CSSProperties = {
  padding: "6px 29px ",
  backgroundColor: "rgba(15, 23, 25, 0.78)",
  borderBottom: "2px solid rgba(15, 23, 25, 0.86)",
  borderRadius: "15px 15px 0 0",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 14px 32px rgba(0, 0, 0, 0.18)",
  backdropFilter: "blur(18px) saturate(120%)",
  WebkitBackdropFilter: "blur(18px) saturate(120%)",
};

export function HomeDesktopView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { initialize, resize, setViewportInsets, reframeToVisibleArea } =
    useMapManager();
  const { routeOperationsActiveDrag, planDropFeedback } = useResourceManager();
  const sectionManager = useSectionManager();
  const baseControlls = useBaseControlls<PayloadBase>();
  const isOrderSelectionMode = useOrderSelectionMode();
  const isOrderOverlayOpen =
    baseControlls.isBaseOpen &&
    typeof baseControlls.payload?.planId === "number";
  const previousOrderOverlayOpenRef = useRef(isOrderOverlayOpen);
  const isOrderOverlayClosing =
    previousOrderOverlayOpenRef.current && !isOrderOverlayOpen;
  previousOrderOverlayOpenRef.current = isOrderOverlayOpen;
  const reframeBlockersRef = useRef({
    hasOverlay: false,
    isOrderOverlayOpen: false,
    isOrderOverlayClosing: false,
    isDynamicSectionClosing: false,
    isOrderSelectionMode: false,
    hasActiveDrag: false,
    hasPlanDropFeedback: false,
  });

  const derivedState = useHomeDesktopDerivedStateFlow({
    sectionManager,
    baseControlls,
  });
  const previousOpenSectionsCountRef = useRef(derivedState.openSectionsCount);
  const isDynamicSectionClosing =
    previousOpenSectionsCountRef.current > derivedState.openSectionsCount;
  previousOpenSectionsCountRef.current = derivedState.openSectionsCount;
  const layout = useHomeDesktopLayout({
    openSectionsCount: derivedState.openSectionsCount,
  });
  reframeBlockersRef.current = {
    hasOverlay: layout.hasOverlay,
    isOrderOverlayOpen,
    isOrderOverlayClosing,
    isDynamicSectionClosing,
    isOrderSelectionMode,
    hasActiveDrag: Boolean(routeOperationsActiveDrag),
    hasPlanDropFeedback: Boolean(planDropFeedback),
  };

  const shouldReframeToVisibleArea = useCallback(() => {
    const blockers = reframeBlockersRef.current;
    if (
      blockers.isOrderOverlayClosing ||
      blockers.isDynamicSectionClosing ||
      blockers.isOrderSelectionMode ||
      blockers.hasActiveDrag ||
      blockers.hasPlanDropFeedback
    ) {
      return false;
    }
    return !blockers.hasOverlay && !blockers.isOrderOverlayOpen;
  }, []);

  useEffect(() => {
    void initialize(mapContainerRef.current);
  }, [initialize]);

  useMapSelectionModeGuardFlow();

  useEffect(() => {
    const handlePlanShortcutSuppression = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "p") {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        Boolean(target?.isContentEditable);

      if (isTypingTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("keydown", handlePlanShortcutSuppression, true);

    return () => {
      window.removeEventListener(
        "keydown",
        handlePlanShortcutSuppression,
        true,
      );
    };
  }, []);

  useEffect(() => {
    setViewportInsets(DEFAULT_VIEWPORT_INSETS);
  }, [setViewportInsets]);

  const { handleRailLayoutChange, handleRailTransitionEnd } =
    useHomeDesktopRailSettleFlow({
      layoutDeps: {
        viewMode: layout.viewMode,
        planColumnWidth: layout.planColumnWidth,
        mapRowHeight: layout.mapRowHeight,
        planRowHeight: layout.planRowHeight,
        hasOverlay: layout.hasOverlay,
        isOrderOverlayOpen,
        isPlanVisible: layout.isPlanVisible,
      },
      resize,
      reframeToVisibleArea,
      shouldReframeToVisibleArea,
    });

  const splitMode = layout.viewMode === "split";
  const activeRoutePlanId =
    typeof baseControlls.payload?.planId === "number"
      ? baseControlls.payload.planId
      : null;

  return (
    <>
      {derivedState.isRouteOperationsOverlayActive ? (
        <RouteGroupWorkspaceRuntime
          planId={activeRoutePlanId}
          isActive={derivedState.isRouteOperationsOverlayActive}
        />
      ) : null}
      <HomeDesktopLayout
        viewMode={layout.viewMode}
        splitMode={splitMode}
        planColumnWidth={layout.planColumnWidth}
        mapRowHeight={layout.mapRowHeight}
        planRowHeight={layout.planRowHeight}
        orderOverlayWidth={layout.orderOverlayWidth}
        overlayWidth={layout.overlayWidth}
        hasOverlay={layout.hasOverlay}
        baseWidth={layout.baseWidth}
        isOrderOverlayOpen={isOrderOverlayOpen}
        onPlanLayoutChange={handleRailLayoutChange}
        onRailTransitionEnd={handleRailTransitionEnd}
        map={<div ref={mapContainerRef} style={MAP_CONTAINER_STYLE} />}
        mapOverlay={
          derivedState.isRouteOperationsOverlayActive ? (
            <RouteGroupMapOverlay />
          ) : (
            <>
              <OrderMapOverlay />
              <ZoneMapOverlay />
            </>
          )
        }
        plan={
          <PlanDesktopShell
            onRequestClose={layout.closePlan}
            viewMode={layout.viewMode}
          />
        }
        base={
          <div
            style={{
              width: layout.baseWidth,
              height: "100%",
              overflowX: "hidden",
            }}
          >
            <SectionPanel
              style={{ width: layout.planWidth }}
              parentParams={{ borderLeft: "#8a8a8a5b" }}
            >
              <OrderPage />
            </SectionPanel>
          </div>
        }
        orderOverlay={
          baseControlls.isBaseOpen ? (
            <SectionPanel
              onRequestClose={baseControlls.closeBase}
              style={{ width: layout.orderOverlayWidth }}
            >
              {baseControlls.payload ? (
                <RouteGroupsPage
                  payload={{
                    ...baseControlls.payload,
                    planId: baseControlls.payload.planId ?? undefined,
                  }}
                  onRequestClose={baseControlls.closeBase}
                />
              ) : null}
            </SectionPanel>
          ) : null
        }
        overlay={
          <SectionManagerHost
            stackKey="dynamicSectionPanels"
            isBaseOpen={baseControlls.isBaseOpen}
            width={layout.orderOverlayWidth}
          />
        }
        buttonTogglePlan={
          layout.canTogglePlan ? (
            <BasicButton
              params={{
                onClick: layout.togglePlan,
                variant: "ghost",
                ariaLabel: "Toggle delivery plan",
                style: splitMode
                  ? PLAN_TOGGLE_BUTTON_SPLIT_STYLE
                  : PLAN_TOGGLE_BUTTON_STYLE,
              }}
            >
              <ChevronDownIcon
                className={`w-5 h-5  text-[var(--color-muted)] transition-transform 
                  ${
                    splitMode
                      ? layout.isPlanVisible
                        ? ""
                        : "rotate-180"
                      : "rotate-90"
                  }
                  `}
              />
            </BasicButton>
          ) : null
        }
        isPlanVisible={layout.isPlanVisible}
      />
    </>
  );
}
