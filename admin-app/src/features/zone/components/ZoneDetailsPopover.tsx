import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { EditIcon, PathEdit } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { useZonePathEditController } from "@/features/zone/controllers/useZonePathEditController";
import { useEnsureZoneTemplate } from "@/features/zone/controllers/useEnsureZoneTemplate";
import {
  selectWorkingZoneVersion,
  selectWorkingZoneVersionId,
  useZoneVersionStore,
} from "@/features/zone/store/zoneVersion.store";
import {
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

const POPOVER_WIDTH = 224;
const WINDOW_PADDING = 12;
const VERTICAL_OFFSET = 10;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-[var(--color-muted)]/70">{label}</span>
    <span className="text-right text-[var(--color-muted)]">{value}</span>
  </div>
);

export const ZoneDetailsPopover = () => {
  const popupManager = usePopupManager();
  const workingVersionId = useZoneVersionStore(selectWorkingZoneVersionId);
  const workingVersion = useZoneVersionStore(selectWorkingZoneVersion);
  const activePopover = useZoneStore((state) => state.activeZoneDetailsPopover);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, workingVersionId, activePopover?.zoneId),
  );
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { load } = useEnsureZoneTemplate(
    workingVersionId,
    activePopover?.zoneId,
  );
  const { beginPathEdit } = useZonePathEditController(
    workingVersionId,
    activePopover?.zoneId,
  );

  const template = zone?.template_full ?? null;
  const isPathEditDisabled = workingVersion?.is_active === true;

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current?.contains(event.target as Node)) {
        return;
      }

      closeZoneDetailsPopover();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [activePopover, closeZoneDetailsPopover]);

  useEffect(() => {
    if (!activePopover || !zone) {
      return;
    }

    if (zone.template_full || zone.is_loading_template || !zone.template_ref) {
      return;
    }

    void load();
  }, [activePopover, load, zone]);

  if (!activePopover || !zone || typeof document === "undefined") {
    return null;
  }

  const { top, left, width, height } = activePopover.anchorRect;
  const unclampedLeft = left + width / 2 - POPOVER_WIDTH / 2;
  const maxLeft = Math.max(
    WINDOW_PADDING,
    window.innerWidth - POPOVER_WIDTH - WINDOW_PADDING,
  );
  const clampedLeft = Math.min(
    Math.max(unclampedLeft, WINDOW_PADDING),
    maxLeft,
  );
  const popoverTop = top + height + VERTICAL_OFFSET;

  return createPortal(
    <div
      ref={popoverRef}
      className="flex flex-col gap-2 pointer-events-auto fixed z-[1200] w-60 rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm"
      style={{
        top: popoverTop,
        left: clampedLeft,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          {zone.name}
        </p>
        {typeof zone.id === "number" && typeof workingVersionId === "number" ? (
          <div className="flex items-center gap-2">
            <BasicButton
              params={{
                variant: "secondary",
                ariaLabel: `Template  ${zone.name ?? "zone"}`,
                className: "inline-flex items-center gap-2",
                onClick: () => {
                  closeZoneDetailsPopover();
                  popupManager.open({
                    key: "zone.form",
                    payload: {
                      mode: "edit",
                      zoneId: zone.id,
                      versionId: workingVersionId,
                    },
                  });
                },
              }}
            >
              <span className="inline-flex items-center gap-2">
                <EditIcon className="h-4 w-4" />
                <span>Template</span>
              </span>
            </BasicButton>
            <BasicButton
              params={{
                variant: "primary",
                ariaLabel: `Path edit ${zone.name ?? "zone"}`,
                disabled: isPathEditDisabled,
                className: "inline-flex items-center justify-center",
                onClick: () => {
                  void beginPathEdit();
                },
              }}
            >
              <PathEdit className="h-4 w-4" />
            </BasicButton>
          </div>
        ) : null}
      </div>
      <div className="space-y-1  py-2 px-2 rounded-lg bg-[var(--color-muted)]/10 text-xs text-[var(--color-muted)]/70">
        {zone.is_loading_template ? (
          <p className="text-[var(--color-muted)]/50">Loading defaults...</p>
        ) : null}
        {!zone.is_loading_template && zone.template_error ? (
          <p className="text-[var(--color-danger,#ef4444)]">
            {zone.template_error}
          </p>
        ) : null}
        {isPathEditDisabled ? (
          <p className="text-[var(--color-muted)]/50">
            Zone boundaries cannot be edited on the active version. Create a new
            draft version to redraw zones.
          </p>
        ) : null}
        {template?.default_facility_id != null ? (
          <DetailRow
            label="Facility"
            value={String(template.default_facility_id)}
          />
        ) : null}
        {template?.max_orders_per_route != null ? (
          <DetailRow
            label="Max orders/route"
            value={String(template.max_orders_per_route)}
          />
        ) : null}
        {template?.max_vehicles != null ? (
          <DetailRow
            label="Max vehicles"
            value={String(template.max_vehicles)}
          />
        ) : null}
        {template?.operating_window_start || template?.operating_window_end ? (
          <DetailRow
            label="Window"
            value={`${template.operating_window_start ?? "--:--"} - ${template.operating_window_end ?? "--:--"}`}
          />
        ) : null}
        {template?.eta_tolerance_seconds != null ? (
          <DetailRow
            label="ETA tolerance"
            value={`${template.eta_tolerance_seconds}s`}
          />
        ) : null}
        {template?.default_route_end_strategy ? (
          <DetailRow
            label="Route end"
            value={template.default_route_end_strategy}
          />
        ) : null}
        {!zone.is_loading_template && !zone.template_error && !template ? (
          <p className="text-[var(--color-muted)]/40">No defaults configured</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
