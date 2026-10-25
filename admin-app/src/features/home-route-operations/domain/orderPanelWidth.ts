/**
 * Width of the main order panel (the right-hand rail holding the order list).
 *
 * TUNE HERE: change ORDER_PANEL_WIDTH_FACTOR and save; the dev server applies
 * it at once. 1 = the widths before the order card redesign (desktop 450,
 * tablet 420). The header order search follows automatically (it measures the
 * panel). Plan column, plan overlay and stacked section panels are unaffected.
 */
export const ORDER_PANEL_BASE_WIDTH = { desktop: 450, tablet: 420 } as const

export const ORDER_PANEL_WIDTH_FACTOR = 0.7

export const resolveOrderPanelWidth = (
  sizeClass: keyof typeof ORDER_PANEL_BASE_WIDTH,
  factor: number = ORDER_PANEL_WIDTH_FACTOR,
): number => Math.round(ORDER_PANEL_BASE_WIDTH[sizeClass] * factor)
