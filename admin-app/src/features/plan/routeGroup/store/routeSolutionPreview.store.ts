import { create } from "zustand";

type RouteSolutionPreviewState = {
  previewedIdByGroupId: Record<number, number | null>;
  loadingPreviewGroupId: number | null;
  setPreviewedId: (routeGroupId: number, solutionId: number | null) => void;
  clearPreviewedId: (routeGroupId: number) => void;
  setLoadingPreviewGroupId: (routeGroupId: number | null) => void;
};

export const useRouteSolutionPreviewStore = create<RouteSolutionPreviewState>(
  (set) => ({
    previewedIdByGroupId: {},
    loadingPreviewGroupId: null,
    setPreviewedId: (routeGroupId, solutionId) =>
      set((state) => ({
        previewedIdByGroupId: {
          ...state.previewedIdByGroupId,
          [routeGroupId]: solutionId,
        },
      })),
    clearPreviewedId: (routeGroupId) =>
      set((state) => {
        const next = { ...state.previewedIdByGroupId };
        delete next[routeGroupId];
        return { previewedIdByGroupId: next };
      }),
    setLoadingPreviewGroupId: (routeGroupId) =>
      set(() => ({ loadingPreviewGroupId: routeGroupId })),
  }),
);

export const getPreviewedSolutionId = (
  routeGroupId: number | null | undefined,
): number | null => {
  if (routeGroupId == null) return null;
  return (
    useRouteSolutionPreviewStore.getState().previewedIdByGroupId[routeGroupId] ??
    null
  );
};
