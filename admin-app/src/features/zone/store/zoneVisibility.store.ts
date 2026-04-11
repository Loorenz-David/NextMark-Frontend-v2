import { create } from "zustand";

type ZoneVisibilityState = {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  toggleVisible: () => void;
};

export const useZoneVisibilityStore = create<ZoneVisibilityState>((set) => ({
  isVisible: true,
  setVisible: (visible) =>
    set((state) => (state.isVisible === visible ? state : { isVisible: visible })),
  toggleVisible: () => set((state) => ({ isVisible: !state.isVisible })),
}));

export const selectZoneVisibility = (state: ZoneVisibilityState) =>
  state.isVisible;
