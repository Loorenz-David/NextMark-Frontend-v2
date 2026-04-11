import { useShallow } from 'zustand/react/shallow'

import { useRouteGroupMapInteractionStore } from './routeGroupMapInteraction.store'

export const useRouteGroupMarkerLookup = () =>
  useRouteGroupMapInteractionStore((state) => state.markerLookup)

export const useRouteGroupMarkerGroupOverlay = () =>
  useRouteGroupMapInteractionStore((state) => state.groupOverlay)

export const useRouteGroupMapInteractionActions = () =>
  useRouteGroupMapInteractionStore(
    useShallow((state) => ({
      setMarkerLookup: state.setMarkerLookup,
      clearMarkerLookup: state.clearMarkerLookup,
      openGroupOverlay: state.openGroupOverlay,
      closeGroupOverlay: state.closeGroupOverlay,
    })),
  )
