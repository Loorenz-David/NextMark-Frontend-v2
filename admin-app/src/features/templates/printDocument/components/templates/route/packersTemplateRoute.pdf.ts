import type { jsPDF } from 'jspdf'

import {
  createRouteLayout,
  drawItemSummary,
  drawKpiSummary,
  drawOrderNotes,
  drawPackByType,
  drawRouteHeader,
  routeTemplateSampleData,
  type RouteTemplateData,
} from './routeTemplate.shared'

// Packer-oriented route sheet: the KPI summary, the item-type summary, and a
// list of every item grouped by type so packers can pull and stage by type
// instead of scanning the scattered stop list.
export const drawPackersTemplateRoute = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const data = rawData as RouteTemplateData
  const layout = createRouteLayout(pdf, widthCm, heightCm)

  drawRouteHeader(pdf, layout, data, 'Packing List')
  drawKpiSummary(pdf, layout, data)
  drawItemSummary(pdf, layout, data)
  drawPackByType(pdf, layout, data)
  drawOrderNotes(pdf, layout, data)
}

export const packersTemplateRouteSampleData = routeTemplateSampleData
