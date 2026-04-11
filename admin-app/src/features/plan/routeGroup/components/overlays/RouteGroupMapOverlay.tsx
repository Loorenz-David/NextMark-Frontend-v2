import { useEffect, useState } from "react";

import { MultiSelectIcon } from "@/assets/icons";
import { useMobile } from "@/app/contexts/MobileContext";
import { DriverLiveMarkerOverlay } from "@/realtime/driverLive";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { MapDrawingSideControls } from "@/shared/map/components/MapDrawingSideControls";
import { MapMultiSelectOverlay } from "@/shared/map/components/MapMultiSelectOverlay";
import {
  DRAWING_SELECTION_CLEAR_EVENT,
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
} from "@/shared/map/domain/constants/drawingSelectionModes";

import {
  useRouteGroupSelectionActions,
  useRouteGroupSelectionMode,
  useSelectedRouteGroupOrdersSummary,
} from "../../store/routeGroupSelectionHooks.store";
import { RouteGroupStatsOverlay } from "./RouteGroupStatsOverlay/RouteGroupStatsOverlay";
import { RouteGroupMarkerGroupOverlay } from "./RouteGroupMarkerGroupOverlay";
import { ZonePolygonOverlay } from "./ZonePolygonOverlay";

export const RouteGroupMapOverlay = () => {
  const { isMobile } = useMobile();
  const isSelectionMode = useRouteGroupSelectionMode();
  const { count, totalWeight, totalItems, totalVolume, itemTypeCounts } =
    useSelectedRouteGroupOrdersSummary();
  const { enableSelectionMode, disableSelectionMode } =
    useRouteGroupSelectionActions();
  const [selectedShape, setSelectedShape] =
    useState<DrawingSelectionMode>("circle");

  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedShape("circle");
    }
  }, [isSelectionMode]);

  const handleShapeSelection = (mode: DrawingSelectionMode) => {
    setSelectedShape(mode);
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(DRAWING_SELECTION_MODE_EVENT, {
        detail: { mode },
      }),
    );
  };

  const handleEraseSelection = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new CustomEvent(DRAWING_SELECTION_CLEAR_EVENT));
  };

  if (isMobile) {
    return null;
  }

  return (
    <>
      <RouteGroupStatsOverlay />
      <MapMultiSelectOverlay
        isSelectionMode={isSelectionMode}
        enableSelectionMode={enableSelectionMode}
        disableSelectionMode={disableSelectionMode}
        enableSelectionAriaLabel="Enable route group multi select"
        disableSelectionAriaLabel="Exit route group selection mode"
        enableLabel={
          <div className="flex items-center justify-center gap-2">
            <MultiSelectIcon className="h-5 w-5 fill-[var(--color-muted)]" />
            <span>Multi Select</span>
          </div>
        }
        title="Route Group Orders Selected"
        count={count}
        totalItems={totalItems}
        totalVolume={totalVolume}
        totalWeight={totalWeight}
        itemTypeCounts={itemTypeCounts}
        sideControls={
          <MapDrawingSideControls
            selectedShape={selectedShape}
            onShapeSelect={handleShapeSelection}
            onClear={handleEraseSelection}
          />
        }
        actions={
          <BasicButton
            params={{
              variant: "secondary",
              onClick: () => undefined,
              ariaLabel: "Route group bulk action placeholder",
              disabled: true,
            }}
          >
            Bulk Action
          </BasicButton>
        }
      />
      <ZonePolygonOverlay />
      <RouteGroupMarkerGroupOverlay />
      <DriverLiveMarkerOverlay />
    </>
  );
};
