import { create } from "zustand";

type RouteGroupIncomingPulseState = {
  sequenceByRouteGroupId: Record<number, number>;
  triggerPulse: (routeGroupId: number | null | undefined) => void;
};

const normalizeRouteGroupId = (routeGroupId: number | null | undefined) =>
  typeof routeGroupId === "number" && Number.isFinite(routeGroupId) && routeGroupId > 0
    ? routeGroupId
    : null;

export const useRouteGroupIncomingPulseStore =
  create<RouteGroupIncomingPulseState>((set) => ({
    sequenceByRouteGroupId: {},
    triggerPulse: (routeGroupId) => {
      const normalizedRouteGroupId = normalizeRouteGroupId(routeGroupId);
      if (!normalizedRouteGroupId) {
        return;
      }

      set((state) => ({
        sequenceByRouteGroupId: {
          ...state.sequenceByRouteGroupId,
          [normalizedRouteGroupId]:
            (state.sequenceByRouteGroupId[normalizedRouteGroupId] ?? 0) + 1,
        },
      }));
    },
  }));

export const triggerIncomingRouteGroupPulse = (
  routeGroupId: number | null | undefined,
) =>
  useRouteGroupIncomingPulseStore.getState().triggerPulse(routeGroupId);

export const useIncomingRouteGroupPulseSequence = (
  routeGroupId: number | null | undefined,
) =>
  useRouteGroupIncomingPulseStore((state) => {
    const normalizedRouteGroupId = normalizeRouteGroupId(routeGroupId);
    if (!normalizedRouteGroupId) return 0;
    return state.sequenceByRouteGroupId[normalizedRouteGroupId] ?? 0;
  });
