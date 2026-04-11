import { create } from "zustand";

import { mapZoneDefinitionToZoneState } from "@/features/zone/domain/zoneState.mapper";
import { doesZoneBBoxIntersectViewport } from "@/features/zone/domain/zoneViewport.domain";
import type {
  GeoJSONPolygon,
  ZoneDefinition,
  ZoneGeometryResolution,
  ZoneLite,
  ZoneState,
  ZoneTemplate,
  ZoneVersion,
} from "@/features/zone/types";
import type { MapBounds } from "@/shared/map/domain/types";

type ZoneEntityTable = Record<number, ZoneState>;
export type EnsureFirstZoneVersionStatus =
  | "idle"
  | "loading"
  | "success"
  | "retryable_failure";
export type ZoneLoadStatus = "idle" | "loading" | "success" | "retryable_failure";
export type ZoneDetailsPopoverState = {
  zoneId: number;
  anchorRect: { top: number; left: number; width: number; height: number };
};
export type ZonePathEditSession = {
  versionId: number;
  zoneId: number;
  originalGeometry: GeoJSONPolygon;
  draftGeometry: GeoJSONPolygon;
  isSaving: boolean;
  error: string | null;
};

type ZoneStoreState = {
  versions: ZoneVersion[];
  activeVersionId: number | null;
  selectedVersionId: number | null;
  selectedZoneIdByVersionId: Record<number, number | null>;
  zoneIdsByVersionId: Record<number, number[]>;
  zonesByVersionId: Record<number, ZoneEntityTable>;
  isZoneMode: boolean;
  drawnGeometry: GeoJSONPolygon | null;
  pathEditSession: ZonePathEditSession | null;
  hoveredZoneId: number | null;
  activeZoneDetailsPopover: ZoneDetailsPopoverState | null;
  isLoadingVersions: boolean;
  ensureFirstVersionStatus: EnsureFirstZoneVersionStatus;
  ensureFirstVersionError: string | null;
  isLoadingZonesByVersionId: Record<number, boolean>;
  zoneLoadStatusByVersionId: Record<number, ZoneLoadStatus>;
  zoneLoadErrorByVersionId: Record<number, string | null>;
  setVersions: (versions: ZoneVersion[]) => void;
  setActiveVersionId: (versionId: number | null) => void;
  setSelectedVersionId: (versionId: number | null) => void;
  replaceZonesForVersion: (versionId: number, zones: ZoneDefinition[]) => void;
  replaceZoneLitesForVersion: (versionId: number, zones: ZoneLite[]) => void;
  setSelectedZoneId: (zoneId: number | null, versionId?: number | null) => void;
  setIsZoneMode: (isZoneMode: boolean) => void;
  setDrawnGeometry: (geometry: GeoJSONPolygon | null) => void;
  startPathEditSession: (
    session: Omit<ZonePathEditSession, "isSaving" | "error">,
  ) => void;
  updatePathEditDraft: (geometry: GeoJSONPolygon) => void;
  setPathEditSaving: (isSaving: boolean) => void;
  setPathEditError: (error: string | null) => void;
  completePathEditSession: (geometry: GeoJSONPolygon) => void;
  cancelPathEditSession: () => void;
  setHoveredZoneId: (zoneId: number | null) => void;
  setActiveZoneDetailsPopover: (popover: ZoneDetailsPopoverState | null) => void;
  toggleZoneDetailsPopover: (popover: ZoneDetailsPopoverState) => void;
  closeZoneDetailsPopover: () => void;
  upsertZone: (zone: ZoneDefinition) => void;
  removeZoneOptimistic: (versionId: number, zoneId: number) => void;
  removeZoneById: (versionId: number, zoneId: number) => void;
  setLoadingVersions: (isLoading: boolean) => void;
  setEnsureFirstVersionStatus: (
    status: EnsureFirstZoneVersionStatus,
    error?: string | null,
  ) => void;
  resetEnsureFirstVersionState: () => void;
  setLoadingZones: (versionId: number, isLoading: boolean) => void;
  setZoneLoadStatus: (
    versionId: number,
    status: ZoneLoadStatus,
    error?: string | null,
  ) => void;
  markZoneGeometryLoading: (versionId: number, zoneId: number, isLoading: boolean) => void;
  markZoneTemplateLoading: (versionId: number, zoneId: number, isLoading: boolean) => void;
  setZoneFullGeometry: (
    versionId: number,
    zoneId: number,
    geometry: GeoJSONPolygon | null,
  ) => void;
  setZoneGeometryError: (
    versionId: number,
    zoneId: number,
    error: string | null,
  ) => void;
  setZoneTemplateFull: (
    versionId: number,
    zoneId: number,
    template: ZoneTemplate | null,
  ) => void;
  setZoneTemplateError: (
    versionId: number,
    zoneId: number,
    error: string | null,
  ) => void;
  upsertZoneLite: (zone: ZoneLite) => void;
  reset: () => void;
};

const initialState = {
  versions: [] as ZoneVersion[],
  activeVersionId: null,
  selectedVersionId: null,
  selectedZoneIdByVersionId: {} as Record<number, number | null>,
  zoneIdsByVersionId: {} as Record<number, number[]>,
  zonesByVersionId: {} as Record<number, ZoneEntityTable>,
  isZoneMode: false,
  drawnGeometry: null as GeoJSONPolygon | null,
  pathEditSession: null as ZonePathEditSession | null,
  hoveredZoneId: null,
  activeZoneDetailsPopover: null as ZoneDetailsPopoverState | null,
  isLoadingVersions: false,
  ensureFirstVersionStatus: "idle" as EnsureFirstZoneVersionStatus,
  ensureFirstVersionError: null,
  isLoadingZonesByVersionId: {} as Record<number, boolean>,
  zoneLoadStatusByVersionId: {} as Record<number, ZoneLoadStatus>,
  zoneLoadErrorByVersionId: {} as Record<number, string | null>,
};

const resolveWorkingVersionId = (state: ZoneStoreState) =>
  state.selectedVersionId ??
  state.activeVersionId ??
  state.versions[0]?.id ??
  (() => {
    const fallbackVersionId = Object.keys(state.zoneIdsByVersionId)[0];
    const parsedVersionId = Number(fallbackVersionId);
    return Number.isFinite(parsedVersionId) ? parsedVersionId : null;
  })();

const getVersionZoneIds = (state: ZoneStoreState, versionId: number) =>
  state.zoneIdsByVersionId[versionId] ?? [];

const getVersionZoneTable = (state: ZoneStoreState, versionId: number) =>
  state.zonesByVersionId[versionId] ?? {};

const areZoneGeometriesEqual = (
  left: GeoJSONPolygon | null,
  right: GeoJSONPolygon | null,
) => JSON.stringify(left) === JSON.stringify(right);

const mergeZoneIntoVersion = (
  state: ZoneStoreState,
  zone: ZoneState,
): Pick<ZoneStoreState, "zoneIdsByVersionId" | "zonesByVersionId" | "selectedZoneIdByVersionId"> => {
  const versionId = zone.version_id;
  const currentIds = getVersionZoneIds(state, versionId);
  const nextIds = currentIds.includes(zone.id) ? currentIds : [...currentIds, zone.id];
  const currentSelectedZoneId = state.selectedZoneIdByVersionId[versionId];

  return {
    zoneIdsByVersionId: {
      ...state.zoneIdsByVersionId,
      [versionId]: nextIds,
    },
    zonesByVersionId: {
      ...state.zonesByVersionId,
      [versionId]: {
        ...getVersionZoneTable(state, versionId),
        [zone.id]: zone,
      },
    },
    selectedZoneIdByVersionId: {
      ...state.selectedZoneIdByVersionId,
      [versionId]:
        typeof currentSelectedZoneId === "number" ? currentSelectedZoneId : zone.id,
    },
  };
};

export const useZoneStore = create<ZoneStoreState>((set) => ({
  ...initialState,
  setVersions: (versions) =>
    set((state) => {
      const activeVersion = versions.find((version) => version.is_active === true);
      const hasSelectedVersion = versions.some(
        (version) => version.id === state.selectedVersionId,
      );
      const nextSelectedVersionId = hasSelectedVersion
        ? state.selectedVersionId
        : typeof activeVersion?.id === "number"
          ? activeVersion.id
          : typeof versions[0]?.id === "number"
            ? versions[0].id
            : null;

      return {
        versions,
        activeVersionId:
          typeof activeVersion?.id === "number" ? activeVersion.id : null,
        selectedVersionId: nextSelectedVersionId,
      };
    }),
  setActiveVersionId: (activeVersionId) => set(() => ({ activeVersionId })),
  setSelectedVersionId: (selectedVersionId) =>
    set((state) => {
      if (selectedVersionId == null) {
        return { selectedVersionId: null };
      }

      const hasSelectedZone =
        typeof state.selectedZoneIdByVersionId[selectedVersionId] === "number";
      const fallbackZoneId = state.zoneIdsByVersionId[selectedVersionId]?.[0] ?? null;

      return {
        selectedVersionId,
        selectedZoneIdByVersionId: hasSelectedZone
          ? state.selectedZoneIdByVersionId
          : {
              ...state.selectedZoneIdByVersionId,
              [selectedVersionId]: fallbackZoneId,
            },
      };
    }),
  replaceZonesForVersion: (versionId, zones) =>
    set((state) => {
      const existingTable = getVersionZoneTable(state, versionId);
      const nextTable: ZoneEntityTable = {};
      const nextIds: number[] = [];

      zones.forEach((zone) => {
        const mappedZone = mapZoneDefinitionToZoneState(
          { ...zone, version_id: zone.version_id ?? versionId },
          typeof zone.id === "number" ? existingTable[zone.id] ?? null : null,
        );

        if (!mappedZone) {
          return;
        }

        nextTable[mappedZone.id] = mappedZone;
        nextIds.push(mappedZone.id);
      });

      const currentSelectedZoneId = state.selectedZoneIdByVersionId[versionId];
      const nextSelectedZoneId =
        typeof currentSelectedZoneId === "number" && nextIds.includes(currentSelectedZoneId)
          ? currentSelectedZoneId
          : nextIds[0] ?? null;

      return {
        zoneIdsByVersionId: {
          ...state.zoneIdsByVersionId,
          [versionId]: nextIds,
        },
        zonesByVersionId: {
          ...state.zonesByVersionId,
          [versionId]: nextTable,
        },
        selectedZoneIdByVersionId: {
          ...state.selectedZoneIdByVersionId,
          [versionId]: nextSelectedZoneId,
        },
      };
    }),
  replaceZoneLitesForVersion: (versionId, zones) =>
    set((state) => {
      const existingTable = getVersionZoneTable(state, versionId);
      const nextTable: ZoneEntityTable = {};
      const nextIds: number[] = [];

      zones.forEach((zone) => {
        const existingZone = existingTable[zone.id] ?? null;
        const nextGeometryResolution: ZoneGeometryResolution =
          existingZone?.geometry_resolution === "full"
            ? "full"
            : zone.geometry_resolution;
        nextTable[zone.id] = {
          id: zone.id,
          version_id: zone.version_id,
          team_id: zone.team_id ?? existingZone?.team_id,
          name: zone.name,
          zone_type: zone.zone_type ?? existingZone?.zone_type ?? null,
          is_active: zone.is_active ?? existingZone?.is_active ?? false,
          centroid: zone.centroid ?? existingZone?.centroid ?? null,
          bbox: zone.bbox,
          geometry_simplified:
            zone.geometry_simplified ?? existingZone?.geometry_simplified ?? null,
          geometry_full: existingZone?.geometry_full ?? null,
          geometry_resolution: nextGeometryResolution,
          template_ref: zone.template_ref ?? existingZone?.template_ref ?? null,
          template_full: existingZone?.template_full ?? null,
          is_loading_geometry: existingZone?.is_loading_geometry ?? false,
          is_loading_template: existingZone?.is_loading_template ?? false,
          geometry_error: existingZone?.geometry_error ?? null,
          template_error: existingZone?.template_error ?? null,
          lastFetchedAt: existingZone?.lastFetchedAt ?? null,
        };
        nextIds.push(zone.id);
      });

      const currentSelectedZoneId = state.selectedZoneIdByVersionId[versionId];
      const nextSelectedZoneId =
        typeof currentSelectedZoneId === "number" && nextIds.includes(currentSelectedZoneId)
          ? currentSelectedZoneId
          : nextIds[0] ?? null;

      return {
        zoneIdsByVersionId: {
          ...state.zoneIdsByVersionId,
          [versionId]: nextIds,
        },
        zonesByVersionId: {
          ...state.zonesByVersionId,
          [versionId]: nextTable,
        },
        selectedZoneIdByVersionId: {
          ...state.selectedZoneIdByVersionId,
          [versionId]: nextSelectedZoneId,
        },
      };
    }),
  setSelectedZoneId: (zoneId, versionId) =>
    set((state) => {
      const resolvedVersionId =
        versionId ?? resolveWorkingVersionId(state) ?? state.selectedVersionId;
      if (typeof resolvedVersionId !== "number") {
        return {};
      }

      return {
        selectedZoneIdByVersionId: {
          ...state.selectedZoneIdByVersionId,
          [resolvedVersionId]: zoneId,
        },
      };
    }),
  setIsZoneMode: (isZoneMode) => set(() => ({ isZoneMode })),
  setDrawnGeometry: (drawnGeometry) => set(() => ({ drawnGeometry })),
  startPathEditSession: (session) =>
    set(() => ({
      pathEditSession: {
        ...session,
        isSaving: false,
        error: null,
      },
      drawnGeometry: null,
    })),
  updatePathEditDraft: (geometry) =>
    set((state) => {
      if (!state.pathEditSession) {
        return state;
      }

      if (
        areZoneGeometriesEqual(state.pathEditSession.draftGeometry, geometry)
      ) {
        return state;
      }

      return {
        ...state,
        pathEditSession: {
          ...state.pathEditSession,
          draftGeometry: geometry,
        },
      };
    }),
  setPathEditSaving: (isSaving) =>
    set((state) => {
      if (!state.pathEditSession) {
        return state;
      }

      return {
        ...state,
        pathEditSession: {
          ...state.pathEditSession,
          isSaving,
        },
      };
    }),
  setPathEditError: (error) =>
    set((state) => {
      if (!state.pathEditSession) {
        return state;
      }

      return {
        ...state,
        pathEditSession: {
          ...state.pathEditSession,
          error,
          isSaving: false,
        },
      };
    }),
  completePathEditSession: () =>
    set((state) => {
      if (!state.pathEditSession) {
        return state;
      }

      return {
        ...state,
        pathEditSession: null,
        drawnGeometry: null,
      };
    }),
  cancelPathEditSession: () =>
    set((state) => {
      if (!state.pathEditSession) {
        return state;
      }

      return {
        ...state,
        pathEditSession: null,
      };
    }),
  setHoveredZoneId: (hoveredZoneId) => set(() => ({ hoveredZoneId })),
  setActiveZoneDetailsPopover: (activeZoneDetailsPopover) =>
    set(() => ({ activeZoneDetailsPopover })),
  toggleZoneDetailsPopover: (popover) =>
    set((state) => ({
      activeZoneDetailsPopover:
        state.activeZoneDetailsPopover?.zoneId === popover.zoneId
          ? null
          : popover,
    })),
  closeZoneDetailsPopover: () =>
    set((state) => {
      if (state.activeZoneDetailsPopover == null) {
        return state;
      }

      return { activeZoneDetailsPopover: null };
    }),
  upsertZone: (zone) =>
    set((state) => {
      const mappedZone = mapZoneDefinitionToZoneState(
        zone,
        typeof zone.id === "number" && typeof zone.version_id === "number"
          ? getVersionZoneTable(state, zone.version_id)[zone.id] ?? null
          : null,
      );
      if (!mappedZone) {
        return {};
      }

      return mergeZoneIntoVersion(state, mappedZone);
    }),
  removeZoneOptimistic: (versionId, zoneId) =>
    set((state) => {
      const currentIds = getVersionZoneIds(state, versionId);
      const nextIds = currentIds.filter((id) => id !== zoneId);
      const currentTable = getVersionZoneTable(state, versionId);
      const { [zoneId]: removedZone, ...nextTable } = currentTable;
      const currentSelectedZoneId = state.selectedZoneIdByVersionId[versionId];

      void removedZone;

      return {
        zoneIdsByVersionId: {
          ...state.zoneIdsByVersionId,
          [versionId]: nextIds,
        },
        zonesByVersionId: {
          ...state.zonesByVersionId,
          [versionId]: nextTable,
        },
        selectedZoneIdByVersionId: {
          ...state.selectedZoneIdByVersionId,
          [versionId]:
            currentSelectedZoneId === zoneId ? nextIds[0] ?? null : currentSelectedZoneId ?? null,
        },
      };
    }),
  removeZoneById: (versionId, zoneId) =>
    set((state) => {
      const currentIds = getVersionZoneIds(state, versionId);
      const nextIds = currentIds.filter((id) => id !== zoneId);
      const currentTable = getVersionZoneTable(state, versionId);
      const { [zoneId]: removedZone, ...nextTable } = currentTable;
      const currentSelectedZoneId = state.selectedZoneIdByVersionId[versionId];

      void removedZone;

      return {
        zoneIdsByVersionId: {
          ...state.zoneIdsByVersionId,
          [versionId]: nextIds,
        },
        zonesByVersionId: {
          ...state.zonesByVersionId,
          [versionId]: nextTable,
        },
        selectedZoneIdByVersionId: {
          ...state.selectedZoneIdByVersionId,
          [versionId]:
            currentSelectedZoneId === zoneId ? nextIds[0] ?? null : currentSelectedZoneId ?? null,
        },
      };
    }),
  setLoadingVersions: (isLoadingVersions) => set(() => ({ isLoadingVersions })),
  setEnsureFirstVersionStatus: (ensureFirstVersionStatus, error = null) =>
    set(() => ({
      ensureFirstVersionStatus,
      ensureFirstVersionError: error,
    })),
  resetEnsureFirstVersionState: () =>
    set(() => ({
      ensureFirstVersionStatus: "idle",
      ensureFirstVersionError: null,
    })),
  setLoadingZones: (versionId, isLoading) =>
    set((state) => ({
      isLoadingZonesByVersionId: {
        ...state.isLoadingZonesByVersionId,
        [versionId]: isLoading,
      },
    })),
  setZoneLoadStatus: (versionId, status, error = null) =>
    set((state) => ({
      zoneLoadStatusByVersionId: {
        ...state.zoneLoadStatusByVersionId,
        [versionId]: status,
      },
      zoneLoadErrorByVersionId: {
        ...state.zoneLoadErrorByVersionId,
        [versionId]: error,
      },
    })),
  markZoneGeometryLoading: (versionId, zoneId, isLoading) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        is_loading_geometry: isLoading,
      });
    }),
  markZoneTemplateLoading: (versionId, zoneId, isLoading) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        is_loading_template: isLoading,
      });
    }),
  setZoneFullGeometry: (versionId, zoneId, geometry) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        geometry_full: geometry,
        geometry_resolution: geometry ? "full" : zone.geometry_simplified ? "simplified" : "none",
        is_loading_geometry: false,
        geometry_error: null,
        lastFetchedAt: new Date().toISOString(),
      });
    }),
  setZoneGeometryError: (versionId, zoneId, error) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        is_loading_geometry: false,
        geometry_error: error,
        geometry_resolution:
          zone.geometry_simplified != null
            ? "simplified"
            : zone.geometry_full != null
              ? "full"
              : "none",
      });
    }),
  setZoneTemplateFull: (versionId, zoneId, template) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        template_full: template,
        template_ref:
          template == null
            ? zone.template_ref
            : {
                id: template.id,
                name: template.name ?? null,
                version: template.version ?? null,
                is_active: template.is_active,
              },
        is_loading_template: false,
        template_error: null,
        lastFetchedAt: new Date().toISOString(),
      });
    }),
  setZoneTemplateError: (versionId, zoneId, error) =>
    set((state) => {
      const zone = getVersionZoneTable(state, versionId)[zoneId];
      if (!zone) return {};

      return mergeZoneIntoVersion(state, {
        ...zone,
        is_loading_template: false,
        template_error: error,
      });
    }),
  upsertZoneLite: (zone) =>
    set((state) => {
      const currentZone = getVersionZoneTable(state, zone.version_id)[zone.id] ?? null;
      const nextZone: ZoneState = {
        id: zone.id,
        version_id: zone.version_id,
        team_id: zone.team_id ?? currentZone?.team_id,
        name: zone.name,
        zone_type: zone.zone_type ?? currentZone?.zone_type ?? null,
        is_active: zone.is_active ?? currentZone?.is_active ?? false,
        centroid: zone.centroid ?? currentZone?.centroid ?? null,
        bbox: zone.bbox,
        geometry_simplified:
          zone.geometry_simplified ?? currentZone?.geometry_simplified ?? null,
        geometry_full: currentZone?.geometry_full ?? null,
        geometry_resolution:
          currentZone?.geometry_resolution === "full"
            ? "full"
            : zone.geometry_resolution,
        template_ref: zone.template_ref ?? currentZone?.template_ref ?? null,
        template_full: currentZone?.template_full ?? null,
        is_loading_geometry: currentZone?.is_loading_geometry ?? false,
        is_loading_template: currentZone?.is_loading_template ?? false,
        geometry_error: currentZone?.geometry_error ?? null,
        template_error: currentZone?.template_error ?? null,
        lastFetchedAt: currentZone?.lastFetchedAt ?? null,
      };

      return mergeZoneIntoVersion(state, nextZone);
    }),
  reset: () => set(() => ({ ...initialState })),
}));

export const selectIsZoneMode = (state: ZoneStoreState) => state.isZoneMode;

export const selectActiveZoneVersion = (state: ZoneStoreState) => {
  if (state.activeVersionId == null) return null;
  return state.versions.find((version) => version.id === state.activeVersionId) ?? null;
};

export const selectSelectedZoneVersion = (state: ZoneStoreState) => {
  const fallbackVersionId = state.selectedVersionId ?? state.activeVersionId;
  if (fallbackVersionId == null) return null;
  return state.versions.find((version) => version.id === fallbackVersionId) ?? null;
};

export const selectWorkingZoneVersion = (state: ZoneStoreState) => {
  const selectedVersion =
    state.selectedVersionId != null
      ? state.versions.find((version) => version.id === state.selectedVersionId) ?? null
      : null;

  if (selectedVersion) return selectedVersion;

  const activeVersion =
    state.activeVersionId != null
      ? state.versions.find((version) => version.id === state.activeVersionId) ?? null
      : null;

  if (activeVersion) return activeVersion;

  return state.versions[0] ?? null;
};

export const selectZonesByVersion = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
) => {
  if (typeof versionId !== "number") return [];
  const zoneIds = getVersionZoneIds(state, versionId);
  const zoneTable = getVersionZoneTable(state, versionId);
  return zoneIds.map((zoneId) => zoneTable[zoneId]).filter(Boolean);
};

export const selectZoneByVersionAndId = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  if (typeof versionId !== "number" || typeof zoneId !== "number") return null;
  return getVersionZoneTable(state, versionId)[zoneId] ?? null;
};

export const selectSelectedZone = (state: ZoneStoreState) => {
  const versionId = resolveWorkingVersionId(state);
  if (typeof versionId !== "number") return null;
  const selectedZoneId = state.selectedZoneIdByVersionId[versionId];
  if (typeof selectedZoneId !== "number") return null;
  return getVersionZoneTable(state, versionId)[selectedZoneId] ?? null;
};

export const selectSelectedZoneId = (state: ZoneStoreState) => {
  const versionId = resolveWorkingVersionId(state);
  if (typeof versionId !== "number") return null;
  return state.selectedZoneIdByVersionId[versionId] ?? null;
};

export const selectWorkingZoneVersionId = (state: ZoneStoreState) =>
  resolveWorkingVersionId(state);

export const selectZonePathEditSession = (state: ZoneStoreState) =>
  state.pathEditSession;

export const selectRenderableZoneGeometry = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = selectZoneByVersionAndId(state, versionId, zoneId);
  if (!zone) return null;
  return zone.geometry_full ?? zone.geometry_simplified ?? null;
};

export const selectZoneTemplateStatus = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = selectZoneByVersionAndId(state, versionId, zoneId);
  if (!zone) return null;

  return {
    isLoading: zone.is_loading_template,
    error: zone.template_error,
    hasTemplateRef: zone.template_ref != null,
    hasTemplateFull: zone.template_full != null,
  };
};

export const selectZoneGeometryStatus = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = selectZoneByVersionAndId(state, versionId, zoneId);
  if (!zone) return null;

  return {
    isLoading: zone.is_loading_geometry,
    error: zone.geometry_error,
    resolution: zone.geometry_resolution,
    hasFullGeometry: zone.geometry_full != null,
  };
};

export const selectVisibleZones = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
  viewport: MapBounds | null,
) =>
  selectZonesByVersion(state, versionId).filter((zone) =>
    doesZoneBBoxIntersectViewport(zone.bbox, viewport),
  );

export const selectIsLoadingZonesForVersion = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
) => {
  if (typeof versionId !== "number") return false;
  return state.isLoadingZonesByVersionId[versionId] ?? false;
};

export const selectZoneLoadStatusForVersion = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
) => {
  if (typeof versionId !== "number") return "idle" as ZoneLoadStatus;
  return state.zoneLoadStatusByVersionId[versionId] ?? "idle";
};

export const selectZoneLoadErrorForVersion = (
  state: ZoneStoreState,
  versionId: number | null | undefined,
) => {
  if (typeof versionId !== "number") return null;
  return state.zoneLoadErrorByVersionId[versionId] ?? null;
};
