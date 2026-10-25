import { resolveOrderPanelWidth, ORDER_PANEL_BASE_WIDTH } from "./orderPanelWidth";

/**
 * Width of the local delivery (route plan) panel, relative to the main order
 * panel. The 5% over the order panel is room for the arrival time flow.
 * Store pickup and international shipping plans keep their own widths.
 */
export const ROUTE_PLAN_PANEL_WIDTH_FACTOR = 1.05;

export const resolveRoutePlanPanelWidth = (
  sizeClass: keyof typeof ORDER_PANEL_BASE_WIDTH,
  orderPanelWidth: number = resolveOrderPanelWidth(sizeClass),
  factor: number = ROUTE_PLAN_PANEL_WIDTH_FACTOR,
): number => Math.round(orderPanelWidth * factor);
