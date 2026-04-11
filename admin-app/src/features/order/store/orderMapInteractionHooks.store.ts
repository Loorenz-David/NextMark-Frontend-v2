import { useShallow } from 'zustand/react/shallow'

import { useOrderMapInteractionStore } from './orderMapInteraction.store'

export const useHoveredOrderClientId = () =>
  useOrderMapInteractionStore((state) => state.hoveredClientId)

export const useOrderMarkerLookup = () =>
  useOrderMapInteractionStore((state) => state.markerLookup)

export const useOrderGroupMarkerOverlay = () =>
  useOrderMapInteractionStore((state) => state.groupOverlay)

export const useOrderMapInteractionActions = () =>
  useOrderMapInteractionStore(
    useShallow((state) => ({
      setHovered: state.setHovered,
      clearHovered: state.clearHovered,
      setMarkerLookup: state.setMarkerLookup,
      clearMarkerLookup: state.clearMarkerLookup,
      openGroupOverlay: state.openGroupOverlay,
      closeGroupOverlay: state.closeGroupOverlay,
    })),
  )
