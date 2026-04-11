import { useEffect, useState } from "react";

import { MultiSelectIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { useMobile } from "@/app/contexts/MobileContext";
import { DriverLiveMarkerOverlay } from "@/realtime/driverLive";
import { MapDrawingSideControls } from "@/shared/map/components/MapDrawingSideControls";
import { MapMultiSelectOverlay } from "@/shared/map/components/MapMultiSelectOverlay";
import {
  DRAWING_SELECTION_CLEAR_EVENT,
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
} from "@/shared/map/domain/constants/drawingSelectionModes";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

import {
  useOrderSelectionActions,
  useOrderSelectionMode,
  useSelectedOrderServerIds,
  useSelectedOrdersSummary,
} from "../store/orderSelectionHooks.store";
import { OrderMarkerGroupOverlay } from "./overlays/OrderMarkerGroupOverlay";

export const OrderMapOverlay = () => {
  const { isMobile } = useMobile();
  const popupManager = usePopupManager();
  const isSelectionMode = useOrderSelectionMode();
  const selectedOrderServerIds = useSelectedOrderServerIds();
  const { count, totalWeight, totalItems, totalVolume, itemTypeCounts } =
    useSelectedOrdersSummary();

  const { enableSelectionMode, disableSelectionMode } =
    useOrderSelectionActions();
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
      <MapMultiSelectOverlay
        isSelectionMode={isSelectionMode}
        enableSelectionMode={enableSelectionMode}
        disableSelectionMode={disableSelectionMode}
        enableSelectionAriaLabel="Enable multi order selection"
        disableSelectionAriaLabel="Exit selection mode"
        enableLabel={
          <div className="flex items-center justify-center gap-2">
            <MultiSelectIcon className="fill-[var(--color-muted)] h-5 w-5" />
            <span>Multi Select</span>
          </div>
        }
        title="Orders Selected"
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
          <>
            <BasicButton
              params={{
                variant: "secondary",
                onClick: () => undefined,
                ariaLabel: "Select plan",
                disabled: true,
              }}
            >
              Select Plan
            </BasicButton>
            <BasicButton
              params={{
                variant: "primary",
                onClick: () => {
                  popupManager.open({
                    key: "PlanForm",
                    payload: {
                      mode: "create",
                      selectedOrderServerIds,
                      source: "order_multi_select",
                    },
                  });
                },
                ariaLabel: "Create plan from selected orders",
              }}
            >
              + Plan
            </BasicButton>
          </>
        }
      />
      <OrderMarkerGroupOverlay />
      <DriverLiveMarkerOverlay />
    </>
  );
};
