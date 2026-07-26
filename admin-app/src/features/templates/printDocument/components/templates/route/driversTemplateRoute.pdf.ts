import type { jsPDF } from 'jspdf'

import {
  createRouteLayout,
  drawItemSummary,
  drawKpiSummary,
  drawOrderNotes,
  drawRouteHeader,
  drawStopCards,
  routeTemplateSampleData,
  type RouteTemplateData,
} from './routeTemplate.shared'

// Driver-oriented route sheet: the KPI summary, a card per stop with its items,
// and the item-type summary. This is the sheet a driver follows stop by stop.
export const drawDriversTemplateRoute = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const data = rawData as RouteTemplateData
  const layout = createRouteLayout(pdf, widthCm, heightCm)

  drawRouteHeader(pdf, layout, data, 'Route Logistics List')
  drawKpiSummary(pdf, layout, data)
  drawStopCards(pdf, layout, data)
  drawItemSummary(pdf, layout, data)
  drawOrderNotes(pdf, layout, data)
}

export const driversTemplateRouteSampleData = routeTemplateSampleData
