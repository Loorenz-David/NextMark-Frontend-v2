import { resolveOrderPanelWidth, ORDER_PANEL_BASE_WIDTH } from "./orderPanelWidth";

/**
 * Width of the plan panel (local delivery, store pickup, international
 * shipping), relative to the main order panel. The 5% over the order panel
 * is room for the arrival time flow.
 */
export const PLAN_PANEL_WIDTH_FACTOR = 1.05;

export const resolvePlanPanelWidth = (
  sizeClass: keyof typeof ORDER_PANEL_BASE_WIDTH,
  orderPanelWidth: number = resolveOrderPanelWidth(sizeClass),
  factor: number = PLAN_PANEL_WIDTH_FACTOR,
): number => Math.round(orderPanelWidth * factor);
