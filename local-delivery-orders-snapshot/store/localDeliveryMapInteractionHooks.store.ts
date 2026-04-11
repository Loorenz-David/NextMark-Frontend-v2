import { useShallow } from 'zustand/react/shallow'

import { useLocalDeliveryMapInteractionStore } from './localDeliveryMapInteraction.store'

export const useLocalDeliveryMarkerLookup = () =>
  useLocalDeliveryMapInteractionStore((state) => state.markerLookup)

export const useLocalDeliveryGroupMarkerOverlay = () =>
  useLocalDeliveryMapInteractionStore((state) => state.groupOverlay)

export const useLocalDeliveryMapInteractionActions = () =>
  useLocalDeliveryMapInteractionStore(
    useShallow((state) => ({
      setMarkerLookup: state.setMarkerLookup,
      clearMarkerLookup: state.clearMarkerLookup,
      openGroupOverlay: state.openGroupOverlay,
      closeGroupOverlay: state.closeGroupOverlay,
    })),
  )

