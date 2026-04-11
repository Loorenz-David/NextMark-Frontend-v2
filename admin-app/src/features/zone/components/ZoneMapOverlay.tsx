import { useEffect, useState } from "react";

import { CloseIcon, LayersIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { MapDrawingSideControls } from "@/shared/map/components/MapDrawingSideControls";
import {
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
} from "@/shared/map/domain/constants/drawingSelectionModes";

import { useZoneMapLayerController } from "@/features/zone/controllers/useZoneMapLayerController";
import { useZoneModeController } from "@/features/zone/controllers/useZoneModeController";
import { useZonePathEditController } from "@/features/zone/controllers/useZonePathEditController";

import { ZonePolygonLayer } from "./ZonePolygonLayer";

export const ZoneMapOverlay = () => {
  useZoneMapLayerController();

  const {
    isZoneMode,
    drawnGeometry,
    pathEditSession,
    activeVersion,
    activeVersionId,
    zoneLoadStatus,
    zoneLoadError,
    ensureFirstVersionStatus,
    ensureFirstVersionError,
    enterZoneMode,
    exitZoneMode,
    discardShape,
    openCreateForm,
    retryEnsureFirstVersion,
  } = useZoneModeController();
  const { savePathEdit, cancelPathEdit } = useZonePathEditController(
    pathEditSession?.versionId ?? activeVersionId,
    pathEditSession?.zoneId ?? null,
  );

  const [activeShape, setActiveShape] =
    useState<DrawingSelectionMode>("polygon");

  useEffect(() => {
    if (!isZoneMode) {
      setActiveShape("polygon");
    }
  }, [isZoneMode]);

  const handleShapeSelect = (mode: DrawingSelectionMode) => {
    setActiveShape(mode);

    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(DRAWING_SELECTION_MODE_EVENT, { detail: { mode } }),
    );
  };

  if (!isZoneMode) {
    return (
      <>
        <div className="pointer-events-auto absolute right-10 top-4 z-0">
          <BasicButton
            params={{
              variant: "secondaryInvers",
              onClick: enterZoneMode,
              ariaLabel: "Enter zone creation mode",
            }}
          >
            <div className="flex items-center gap-2">
              <LayersIcon className="h-4 w-4 app-icon" />
              <span>Zones</span>
            </div>
          </BasicButton>
        </div>
        <ZonePolygonLayer />
      </>
    );
  }

  const hasEnsureFirstVersionFailure =
    ensureFirstVersionStatus === "retryable_failure";
  const hasZoneLoadFailure = zoneLoadStatus === "retryable_failure";
  const isPathEditing = pathEditSession != null;
  const hasActiveVersion =
    typeof activeVersion?.id === "number" ||
    typeof activeVersionId === "number";

  return (
    <>
      <div className="pointer-events-auto absolute right-10 top-4 z-0">
        <div className="relative w-52 rounded-xl border border-[var(--color-muted)]/30 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
          <button
            aria-label="Exit zone mode"
            className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-muted)]/30 bg-[var(--color-page)] text-[var(--color-muted)] shadow-sm"
            onClick={exitZoneMode}
            type="button"
          >
            <CloseIcon className="h-3 w-3" />
          </button>

          <p className="mb-3 text-sm font-semibold text-[var(--color-muted)]">
            {isPathEditing ? "Zone Path Edit" : "Zone Mode"}
          </p>

          {!isPathEditing ? (
            <MapDrawingSideControls
              selectedShape={activeShape}
              onShapeSelect={handleShapeSelect}
              onClear={discardShape}
              shapeOrder={["polygon", "rectangle", "circle"]}
              disabled={!hasActiveVersion}
              clearDisabled={drawnGeometry == null}
              wrapperClassName="absolute -left-36 top-0 flex w-32 flex-col gap-2"
            />
          ) : null}

          {hasEnsureFirstVersionFailure ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--color-muted)]/60">
                {ensureFirstVersionError ??
                  "Unable to initialize zone version."}
              </p>
              <BasicButton
                params={{
                  variant: "secondary",
                  onClick: retryEnsureFirstVersion,
                  ariaLabel: "Retry loading zone version",
                }}
              >
                Retry
              </BasicButton>
            </div>
          ) : hasZoneLoadFailure ? (
            <p className="text-xs text-[var(--color-muted)]/60">
              {zoneLoadError ?? "Unable to load zones for this version."}
            </p>
          ) : !hasActiveVersion ? (
            <p className="text-xs text-[var(--color-muted)]/60">
              No zone version available.
            </p>
          ) : isPathEditing ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--color-muted)]/60">
                Edit the current zone shape on the map, then save or cancel.
              </p>
              {pathEditSession?.error ? (
                <p className="text-xs text-[var(--color-danger,#ef4444)]">
                  {pathEditSession.error}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <BasicButton
                  params={{
                    variant: "secondary",
                    onClick: cancelPathEdit,
                    disabled: pathEditSession.isSaving,
                    ariaLabel: "Cancel zone path edit",
                  }}
                >
                  Cancel
                </BasicButton>
                <BasicButton
                  params={{
                    variant: "primary",
                    onClick: () => void savePathEdit(),
                    disabled: pathEditSession.isSaving,
                    ariaLabel: "Save zone path",
                  }}
                >
                  {pathEditSession.isSaving ? "Saving..." : "Save Path"}
                </BasicButton>
              </div>
            </div>
          ) : drawnGeometry == null ? (
            <p className="text-xs text-[var(--color-muted)]/60">
              Draw a zone boundary on the map.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {/* <button
                type="button"
                onClick={discardShape}
                className="text-left text-xs text-[var(--color-muted)]/70 underline underline-offset-2"
              >
                Discard shape
              </button> */}

              <BasicButton
                params={{
                  variant: "primary",
                  onClick: openCreateForm,
                  ariaLabel: "Create zone from drawn shape",
                }}
              >
                Create Zone
              </BasicButton>
            </div>
          )}
        </div>
      </div>
      <ZonePolygonLayer />
    </>
  );
};
