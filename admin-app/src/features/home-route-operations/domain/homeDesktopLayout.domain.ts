import type { PlanContainerView } from '@/features/plan'

export type DesktopPlanViewMode = 'rail' | 'split'

export const DESKTOP_PLAN_WIDTH = 450
// The map keeps a fixed rail on the left while the Plans calendar takes the
// rest of the center. Folding the calendar hands the freed space back to the map.
export const DESKTOP_MAP_RAIL_WIDTH = 320
export const DESKTOP_SPLIT_RATIO = 50

export type HomeDesktopTracksInput = {
  viewMode: DesktopPlanViewMode
  isPlanVisible: boolean
  isMapVisible: boolean
  planContainerView: PlanContainerView
  railColumnWidth: number
}

export type HomeDesktopTracks = {
  /** Width of the plan grid column (rail mode). `0` when the plan is folded or in split mode. */
  planColumnWidth: number | string
  /** Percentage height of the map row (split mode). `100` in rail mode. */
  mapRowHeight: number
  /** Percentage height of the plan row (split mode). `0` in rail mode. */
  planRowHeight: number
  canTogglePlan: boolean
  canToggleMap: boolean
}

/**
 * Resolves the desktop grid tracks for the map | plan | rail layout.
 *
 * The map column is always `minmax(0, 1fr)` and is never animated directly:
 * CSS grid only interpolates length-to-length tracks. Folding the map is
 * expressed by letting the plan column claim the whole center width so the
 * flexible map track collapses to zero on its own.
 *
 * Invariant: the two center panels can never be folded at the same time.
 */
export const resolveHomeDesktopTracks = ({
  viewMode,
  isPlanVisible,
  isMapVisible,
  planContainerView,
  railColumnWidth,
}: HomeDesktopTracksInput): HomeDesktopTracks => {
  const canTogglePlan = isMapVisible
  const canToggleMap = isPlanVisible

  if (viewMode === 'split') {
    const mapRowHeight = !isMapVisible ? 0 : isPlanVisible ? DESKTOP_SPLIT_RATIO : 100
    return {
      planColumnWidth: 0,
      mapRowHeight,
      planRowHeight: 100 - mapRowHeight,
      canTogglePlan,
      canToggleMap,
    }
  }

  const planColumnWidth: number | string = !isPlanVisible
    ? 0
    : !isMapVisible
      ? `calc(100vw - ${railColumnWidth}px)`
      : planContainerView === 'calendar'
        ? `calc(100vw - ${DESKTOP_MAP_RAIL_WIDTH}px - ${railColumnWidth}px)`
        : DESKTOP_PLAN_WIDTH

  return {
    planColumnWidth,
    mapRowHeight: 100,
    planRowHeight: 0,
    canTogglePlan,
    canToggleMap,
  }
}
