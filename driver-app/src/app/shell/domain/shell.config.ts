export const DRIVER_SHELL_CONFIG = {
  bottomSheet: {
    snapHeights: {
      collapsed: 10,
      workspace: 45,
      expanded: 98,
    },
    headerFadeEndPercent: 84,
    interactionButtonsFadeOffsetPercent: 5,
    directionLockThresholdPx: 10,
    contentDragActivationThresholdPx: 10,
    contentDragDirectionBiasPx: 4,
    snapAnimationMs: 220,
    topRadiusPx: 28,
  },
  map: {
    overlapBehindSheetPx: 32,
    responsiveResizeThresholdPercent: 45,
  },
  sideMenu: {
    widthViewportPercent: 93,
    maxWidthPx: 420,
  },
} as const
