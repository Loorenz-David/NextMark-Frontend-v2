import { create } from "zustand";

export type RouteGroupZonePreviewMode = "active" | "all";

type RouteGroupZonePreviewState = {
  mode: RouteGroupZonePreviewMode;
  setMode: (mode: RouteGroupZonePreviewMode) => void;
};

export const useRouteGroupZonePreviewStore =
  create<RouteGroupZonePreviewState>((set) => ({
    mode: "active",
    setMode: (mode) =>
      set((state) => (state.mode === mode ? state : { mode })),
  }));

export const selectRouteGroupZonePreviewMode = (
  state: RouteGroupZonePreviewState,
) => state.mode;
