import { create } from 'zustand'

export type RouteGroupMarkerGroupLookup = {
  markerOrderClientIdsByMarkerId: Record<string, string[]>
  primaryOrderClientIdByMarkerId: Record<string, string>
  markerIdByOrderClientId: Record<string, string>
}

type RouteGroupMarkerGroupOverlayState = {
  markerId: string | null
  markerAnchorEl: HTMLElement | null
  orderClientIds: string[]
}

type RouteGroupMapInteractionState = {
  markerLookup: RouteGroupMarkerGroupLookup
  groupOverlay: RouteGroupMarkerGroupOverlayState
  setMarkerLookup: (lookup: RouteGroupMarkerGroupLookup) => void
  clearMarkerLookup: () => void
  openGroupOverlay: (params: {
    markerId: string
    markerAnchorEl: HTMLElement
    orderClientIds: string[]
  }) => void
  closeGroupOverlay: () => void
}

const EMPTY_LOOKUP: RouteGroupMarkerGroupLookup = {
  markerOrderClientIdsByMarkerId: {},
  primaryOrderClientIdByMarkerId: {},
  markerIdByOrderClientId: {},
}

const EMPTY_GROUP_OVERLAY: RouteGroupMarkerGroupOverlayState = {
  markerId: null,
  markerAnchorEl: null,
  orderClientIds: [],
}

const areStringMapsEqual = (
  left: Record<string, string>,
  right: Record<string, string>,
): boolean => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every((key) => left[key] === right[key])
}

const areStringArrayMapsEqual = (
  left: Record<string, string[]>,
  right: Record<string, string[]>,
): boolean => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => {
    const leftArr = left[key] ?? []
    const rightArr = right[key] ?? []
    if (leftArr.length !== rightArr.length) return false
    return leftArr.every((value, index) => value === rightArr[index])
  })
}

const isSameLookup = (
  left: RouteGroupMarkerGroupLookup,
  right: RouteGroupMarkerGroupLookup,
): boolean => (
  areStringArrayMapsEqual(left.markerOrderClientIdsByMarkerId, right.markerOrderClientIdsByMarkerId)
  && areStringMapsEqual(left.primaryOrderClientIdByMarkerId, right.primaryOrderClientIdByMarkerId)
  && areStringMapsEqual(left.markerIdByOrderClientId, right.markerIdByOrderClientId)
)

export const useRouteGroupMapInteractionStore = create<RouteGroupMapInteractionState>((set) => ({
  markerLookup: EMPTY_LOOKUP,
  groupOverlay: EMPTY_GROUP_OVERLAY,
  setMarkerLookup: (lookup) =>
    set((state) => {
      const sameLookup = isSameLookup(state.markerLookup, lookup)
      const currentOverlayMarkerId = state.groupOverlay.markerId
      if (!currentOverlayMarkerId) {
        if (sameLookup) {
          return state
        }
        return {
          ...state,
          markerLookup: lookup,
        }
      }

      const overlayMarkerStillVisible = Boolean(lookup.markerOrderClientIdsByMarkerId[currentOverlayMarkerId])
      const sameOverlay = overlayMarkerStillVisible
      if (sameLookup && sameOverlay) {
        return state
      }
      return {
        ...state,
        markerLookup: lookup,
        groupOverlay: overlayMarkerStillVisible ? state.groupOverlay : EMPTY_GROUP_OVERLAY,
      }
    }),
  clearMarkerLookup: () =>
    set((state) => ({
      ...state,
      markerLookup: EMPTY_LOOKUP,
      groupOverlay: EMPTY_GROUP_OVERLAY,
    })),
  openGroupOverlay: ({ markerId, markerAnchorEl, orderClientIds }) =>
    set((state) => ({
      ...state,
      groupOverlay: {
        markerId,
        markerAnchorEl,
        orderClientIds,
      },
    })),
  closeGroupOverlay: () =>
    set((state) => {
      if (!state.groupOverlay.markerId && state.groupOverlay.orderClientIds.length === 0) {
        return state
      }
      return {
        ...state,
        groupOverlay: EMPTY_GROUP_OVERLAY,
      }
    }),
}))
