import { create } from 'zustand'

export type OrderMapHoverSource = 'list' | 'map'

export type OrderMarkerGroupLookup = {
  markerOrderClientIdsByMarkerId: Record<string, string[]>
  primaryOrderClientIdByMarkerId: Record<string, string>
  markerIdByOrderClientId: Record<string, string>
}

type OrderGroupOverlayState = {
  markerId: string | null
  markerAnchorEl: HTMLElement | null
  orderClientIds: string[]
}

type OrderMapInteractionState = {
  hoveredClientId: string | null
  hoverSource: OrderMapHoverSource | null
  markerLookup: OrderMarkerGroupLookup
  groupOverlay: OrderGroupOverlayState
  setHovered: (clientId: string, source: OrderMapHoverSource) => void
  clearHovered: (source?: OrderMapHoverSource) => void
  setMarkerLookup: (lookup: OrderMarkerGroupLookup) => void
  clearMarkerLookup: () => void
  openGroupOverlay: (params: {
    markerId: string
    markerAnchorEl: HTMLElement
    orderClientIds: string[]
  }) => void
  closeGroupOverlay: () => void
}

const EMPTY_LOOKUP: OrderMarkerGroupLookup = {
  markerOrderClientIdsByMarkerId: {},
  primaryOrderClientIdByMarkerId: {},
  markerIdByOrderClientId: {},
}

const EMPTY_GROUP_OVERLAY: OrderGroupOverlayState = {
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
  left: OrderMarkerGroupLookup,
  right: OrderMarkerGroupLookup,
): boolean => (
  areStringArrayMapsEqual(left.markerOrderClientIdsByMarkerId, right.markerOrderClientIdsByMarkerId)
  && areStringMapsEqual(left.primaryOrderClientIdByMarkerId, right.primaryOrderClientIdByMarkerId)
  && areStringMapsEqual(left.markerIdByOrderClientId, right.markerIdByOrderClientId)
)

export const useOrderMapInteractionStore = create<OrderMapInteractionState>((set) => ({
  hoveredClientId: null,
  hoverSource: null,
  markerLookup: EMPTY_LOOKUP,
  groupOverlay: EMPTY_GROUP_OVERLAY,
  setHovered: (clientId, source) =>
    set((state) => {
      if (state.hoveredClientId === clientId && state.hoverSource === source) {
        return state
      }
      return {
        ...state,
        hoveredClientId: clientId,
        hoverSource: source,
      }
    }),
  clearHovered: (source) =>
    set((state) => {
      if (source && state.hoverSource !== source) {
        return state
      }
      if (state.hoveredClientId == null && state.hoverSource == null) {
        return state
      }
      return {
        ...state,
        hoveredClientId: null,
        hoverSource: null,
      }
    }),
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
