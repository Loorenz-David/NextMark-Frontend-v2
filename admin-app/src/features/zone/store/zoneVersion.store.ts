import { create } from "zustand";

import type { ZoneVersion } from "../types";

export type EnsureFirstZoneVersionStatus =
  | "idle"
  | "loading"
  | "success"
  | "retryable_failure";

type ZoneVersionStoreState = {
  versions: ZoneVersion[];
  selectedVersionId: number | null;
  isLoadingVersions: boolean;
  ensureFirstVersionStatus: EnsureFirstZoneVersionStatus;
  ensureFirstVersionError: string | null;
  setVersions: (versions: ZoneVersion[]) => void;
  upsertVersion: (version: ZoneVersion) => void;
  setSelectedVersionId: (versionId: number | null) => void;
  setLoadingVersions: (isLoading: boolean) => void;
  setEnsureFirstVersionStatus: (
    status: EnsureFirstZoneVersionStatus,
    error?: string | null,
  ) => void;
  resetEnsureFirstVersionState: () => void;
};

const compareZoneVersions = (left: ZoneVersion, right: ZoneVersion) => {
  const leftVersionNumber =
    typeof left.version_number === "number" ? left.version_number : -Infinity;
  const rightVersionNumber =
    typeof right.version_number === "number" ? right.version_number : -Infinity;

  if (leftVersionNumber !== rightVersionNumber) {
    return rightVersionNumber - leftVersionNumber;
  }

  const leftId = typeof left.id === "number" ? left.id : -Infinity;
  const rightId = typeof right.id === "number" ? right.id : -Infinity;

  return rightId - leftId;
};

export const resolveLatestZoneVersion = (versions: ZoneVersion[]) =>
  [...versions].sort(compareZoneVersions)[0] ?? null;

export const resolveActiveOrLatestZoneVersion = (versions: ZoneVersion[]) =>
  versions.find((version) => version.is_active === true) ??
  resolveLatestZoneVersion(versions);

export const useZoneVersionStore = create<ZoneVersionStoreState>((set) => ({
  versions: [],
  selectedVersionId: null,
  isLoadingVersions: false,
  ensureFirstVersionStatus: "idle",
  ensureFirstVersionError: null,
  setVersions: (versions) =>
    set((state) => {
      const nextSelectedVersion =
        versions.find((version) => version.id === state.selectedVersionId) ??
        resolveActiveOrLatestZoneVersion(versions);

      return {
        versions,
        selectedVersionId:
          typeof nextSelectedVersion?.id === "number"
            ? nextSelectedVersion.id
            : null,
      };
    }),
  upsertVersion: (version) =>
    set((state) => {
      const nextVersions = state.versions.some((current) => current.id === version.id)
        ? state.versions.map((current) =>
            current.id === version.id ? { ...current, ...version } : current,
          )
        : [...state.versions, version];

      const nextSelectedVersion =
        nextVersions.find((current) => current.id === state.selectedVersionId) ??
        resolveActiveOrLatestZoneVersion(nextVersions);

      return {
        versions: nextVersions,
        selectedVersionId:
          typeof nextSelectedVersion?.id === "number"
            ? nextSelectedVersion.id
            : null,
      };
    }),
  setSelectedVersionId: (selectedVersionId) => set(() => ({ selectedVersionId })),
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
}));

export const selectZoneVersions = (state: ZoneVersionStoreState) => state.versions;

export const selectActiveZoneVersion = (state: ZoneVersionStoreState) =>
  state.versions.find((version) => version.is_active === true) ?? null;

export const selectLatestZoneVersion = (state: ZoneVersionStoreState) =>
  resolveLatestZoneVersion(state.versions);

export const selectSelectedZoneVersion = (state: ZoneVersionStoreState) =>
  typeof state.selectedVersionId === "number"
    ? state.versions.find((version) => version.id === state.selectedVersionId) ?? null
    : null;

export const selectWorkingZoneVersion = (state: ZoneVersionStoreState) =>
  selectSelectedZoneVersion(state) ??
  selectActiveZoneVersion(state) ??
  selectLatestZoneVersion(state);

export const selectWorkingZoneVersionId = (state: ZoneVersionStoreState) =>
  selectWorkingZoneVersion(state)?.id ?? null;

export const selectActiveOrLatestZoneVersionId = (state: ZoneVersionStoreState) =>
  (selectActiveZoneVersion(state) ?? selectLatestZoneVersion(state))?.id ?? null;
