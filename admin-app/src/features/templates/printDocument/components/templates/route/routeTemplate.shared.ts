import type { jsPDF } from 'jspdf'

import { formatMetric } from '@shared-utils'
import type { ItemProperty } from '@shared-domain'
import { normalizeItemProperties } from '@shared-domain'
import type { availableOrientations } from '@/features/templates/printDocument/types'

// ─── Data shapes ──────────────────────────────────────────────────────────────

export type RouteItem = {
  article_number?: string | null
  item_position?: string | null
  item_type?: string | null
  quantity?: number | null
  properties?: ItemProperty[] | Record<string, unknown> | null
}

export type RouteOrderNote =
  | string
  | { type?: string | null; content?: string | null; creation_date?: string | null }

export type RouteOrder = {
  stop_order?: number | null
  order_scalar_id?: number | null
  order_identity?: string | null
  reference_number?: string | null
  external_source?: string | null
  client_address?: string | null
  expected_arrival_time?: string | null
  order_notes?: RouteOrderNote[] | null
  items?: RouteItem[] | null
}

export type RouteSummaryEntry = {
  item_type?: string | null
  quantity?: number | null
  total_weight?: number | null
  total_volume?: number | null
}

export type RouteTemplateData = {
  orientation?: availableOrientations | null
  plan_date?: string | null
  stop_count?: number | null
  total_distance?: number | null
  total_travel_time?: string | null
  expected_start_time?: string | null
  expected_end_time?: string | null
  driver?: string | null
  item_count?: number | null
  total_weight?: number | null
  total_volume?: number | null
  item_type_summary?: RouteSummaryEntry[] | null
  orders?: RouteOrder[] | null
}

// ─── Summary expansion rules ─────────────────────────────────────────────────
// Each rule adds property sub-totals beneath a specific item type in the item
// summary section. Add or remove entries to control which types get sub-totals.

type SummaryExpansionRule = {
  itemType: string
  groupByProperty: string
  sumProperty: string
  // Descriptive word for the nested rows: "{label} {groupValue} : {total}".
  label: string
}

const SUMMARY_EXPANSION_RULES: SummaryExpansionRule[] = [
  {
    itemType: 'Dining Table',
    groupByProperty: 'extension_type',
    sumProperty: 'number_of_extensions',
    label: 'extensions',
  },
]

// ─── Layout constants (cm) ──────────────────────────────────────────────────

const M = 0.9     // page margin
const GAP = 0.45  // vertical gap between sections

// Distance from baseline to top of capital letter (in cm).
// Used to vertically centre text: baseline = boxTop + boxH/2 + capH(pt)/2
const capH = (pt: number) => pt * 0.026

const FS = {
  title: 15,
  date: 9,
  label: 7,
  value: 10,
  stopHdr: 9,
  table: 8.5,
  propsKey: 7,
} as const

// Shared card metrics used by the stop cards and the pack-by-type list.
const HDR_H = 0.58        // stop / group header row height
const CARD_PAD_H = 0.2    // horizontal padding inside card
const TBL_HDR_H = 0.42    // table header height
const TBL_ROW_H = 0.60    // base row height (single line)
const PROP_LINE_H = 0.30  // extra height per additional properties line
const CONT_PAD_V = 0.20   // vertical padding in content area

const DARK: [number, number, number] = [26, 26, 26]
const MID: [number, number, number] = [85, 85, 85]
const MUTED: [number, number, number] = [97, 97, 97]
const PROP_KEY_CLR: [number, number, number] = [110, 110, 110]
const PROP_SEP_CLR: [number, number, number] = [170, 170, 170]

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const safe = (v: unknown): string => {
  if (v == null) return '--'
  const s = String(v).trim()
  return s || '--'
}

const fmtNum = (v: number | null | undefined): string => {
  if (typeof v !== 'number' || Number.isNaN(v)) return '--'
  return String(Number(v.toFixed(2)))
}

// formatMetric normalises volume to '㎥' (U+33A5) which is outside Latin-1.
// jsPDF built-in Helvetica is Latin-1 only, so we format volume locally using
// the superscript-3 character U+00B3 ('³') which is Latin-1 safe.
const fmtVol = (v: number): string => {
  const m3 = Number.isFinite(v) ? v / 1_000_000 : 0
  return `${Number(m3.toFixed(2))} m³`
}

const formatRouteOrderIdentity = (order: RouteOrder): string => {
  const preparedIdentity = order.order_identity?.trim()
  if (preparedIdentity) return preparedIdentity

  const referenceNumber = order.reference_number?.trim()
  const externalSource = order.external_source?.trim()
  if (externalSource && referenceNumber) {
    return referenceNumber.startsWith('#') ? referenceNumber : `#${referenceNumber}`
  }

  return order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'
}

// Keys are stored snake_case; only the first word is shown so a long key
// cannot eat the row. A single word longer than the cap is still truncated
// with ".." (Latin-1 safe for the built-in Helvetica font).
const PROP_NAME_MAX_CHARS = 14

const capPropName = (name: string): string => {
  const firstWord = name.trim().split('_')[0] ?? name.trim()
  return firstWord.length > PROP_NAME_MAX_CHARS
    ? `${firstWord.slice(0, PROP_NAME_MAX_CHARS - 2)}..`
    : firstWord
}

const fmtProps = (props?: RouteItem['properties']): string => {
  const entries = normalizeItemProperties(props) ?? []
  const parts = entries
    .filter((entry) => {
      const name = entry.name.trim()
      return name && name.toLowerCase() !== 'notes' && entry.value != null
    })
    .map((entry) => `${capPropName(entry.name)}: ${String(entry.value)}`)
  return parts.length ? parts.join(' · ') : '--'
}

// Only general and customer notes are surfaced on the route sheets; failure
// notes are operational and intentionally excluded. Customer notes sort first.
type RouteNote = { label: string; content: string; priority: number }

const extractOrderNotes = (order: RouteOrder): RouteNote[] => {
  const raw = order.order_notes
  const entries = Array.isArray(raw) ? raw : raw != null ? [raw] : []

  const notes: RouteNote[] = []
  for (const entry of entries) {
    if (typeof entry === 'string') {
      const content = entry.trim()
      if (content) notes.push({ label: 'General', content, priority: 2 })
      continue
    }
    if (!entry || typeof entry !== 'object') continue
    const content = typeof entry.content === 'string' ? entry.content.trim() : ''
    if (!content) continue
    const type = String(entry.type ?? 'GENERAL').toUpperCase()
    if (type === 'COSTUMER') notes.push({ label: 'Customer', content, priority: 1 })
    else if (type === 'GENERAL') notes.push({ label: 'General', content, priority: 2 })
  }

  return notes.sort((a, b) => a.priority - b.priority)
}

// Item-type matching for expansion rules tolerates case and surrounding
// whitespace so a rule configured as "Dining Table" still matches "dining table".
const normalizeItemType = (value: string) => value.trim().toLowerCase()

const normalizePropertyKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll('extention', 'extension')
    .replaceAll('extentions', 'extensions')

const getItemPropertyValue = (
  properties: RouteItem['properties'],
  propertyKey: string,
): unknown => {
  const entries = normalizeItemProperties(properties) ?? []
  const normalizedPropertyKey = normalizePropertyKey(propertyKey)
  return entries.find(
    (entry) => normalizePropertyKey(entry.name) === normalizedPropertyKey,
  )?.value
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function setFont(
  pdf: jsPDF,
  pt: number,
  bold: boolean,
  color: [number, number, number],
) {
  pdf.setFont('helvetica', bold ? 'bold' : 'normal')
  pdf.setFontSize(pt)
  pdf.setTextColor(color[0], color[1], color[2])
}

function drawHLine(pdf: jsPDF, x1: number, y: number, x2: number, w: number, r: number, g: number, b: number) {
  pdf.setDrawColor(r, g, b)
  pdf.setLineWidth(w)
  pdf.line(x1, y, x2, y)
}

function renderPropsLine(
  pdf: jsPDF,
  lineText: string,
  x: number,
  y: number,
  valueFs: number = FS.table,
  keyFs: number = FS.propsKey,
): void {
  const segments = lineText.split(' · ')
  let cx = x
  segments.forEach((seg, i) => {
    if (i > 0) {
      setFont(pdf, valueFs, false, PROP_SEP_CLR)
      const sepW = pdf.getTextWidth(' · ')
      pdf.text(' · ', cx, y)
      cx += sepW
    }
    const colonIdx = seg.indexOf(': ')
    if (colonIdx > -1) {
      const keyPart = seg.slice(0, colonIdx) + ':'
      const valuePart = seg.slice(colonIdx + 2)
      setFont(pdf, keyFs, false, PROP_KEY_CLR)
      pdf.text(keyPart, cx, y)
      cx += pdf.getTextWidth(keyPart)
      setFont(pdf, valueFs, false, DARK)
      pdf.text(' ' + valuePart, cx, y)
      cx += pdf.getTextWidth(' ' + valuePart)
    } else {
      setFont(pdf, valueFs, false, DARK)
      pdf.text(seg, cx, y)
      cx += pdf.getTextWidth(seg)
    }
  })
}

const buildExpansionGroups = (
  rule: SummaryExpansionRule,
  orders: RouteOrder[],
): Map<string, number> => {
  const groups = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      if (normalizeItemType(item.item_type ?? '') !== normalizeItemType(rule.itemType)) continue
      const props = item.properties
      if (!props) continue
      const groupVal = getItemPropertyValue(props, rule.groupByProperty)
      const addVal = Number(getItemPropertyValue(props, rule.sumProperty) ?? 0)
      if (groupVal == null) continue
      const groupStr = String(groupVal).trim()
      if (!groupStr) continue
      groups.set(groupStr, (groups.get(groupStr) ?? 0) + (Number.isFinite(addVal) ? addVal : 0))
    }
  }
  return groups
}

// ─── Sample data for preview ────────────────────────────────────────────────

const _sampleOrders: RouteOrder[] = [
  {
    stop_order: 1,
    order_scalar_id: 10234,
    order_identity: '#10234',
    client_address: '14 North Bridge Ave',
    expected_arrival_time: '08:45',
    order_notes: [
      { type: 'COSTUMER', content: 'Please call on arrival, doorbell is broken.' },
      { type: 'GENERAL', content: 'Fragile — top-load only.' },
    ],
    items: [
      { article_number: 'A-9932', item_position: 'DL1', item_type: 'Dining Chair', quantity: 4, properties: [{ name: 'color', value: 'Oak' }, { name: 'floor', value: 2 }] },
      { article_number: 'B-1109', item_position: 'DT2', item_type: 'Dining Table', quantity: 1, properties: [{ name: 'size', value: '180x90' }, { name: 'extention_type', value: 'outside' }, { name: 'number_of_extentions', value: 2 }] },
    ],
  },
  {
    stop_order: 2,
    order_scalar_id: 10235,
    order_identity: '#10235',
    client_address: '8B Lake Park Road',
    expected_arrival_time: '09:20',
    order_notes: [
      { type: 'GENERAL', content: 'Leave with the building concierge if no answer.' },
    ],
    items: [
      { article_number: 'C-4311', item_position: 'BK3', item_type: 'Dining Table', quantity: 1, properties: [{ name: 'size', value: '160x80' }, { name: 'extention_type', value: 'inside' }, { name: 'number_of_extentions', value: 1 }] },
      { article_number: 'D-0982', item_position: 'SF1', item_type: 'Bookshelf', quantity: 2, properties: [{ name: 'levels', value: 5 }] },
    ],
  },
]

const _deriveItemTypeSummary = (orders: RouteOrder[]) => {
  const map = new Map<string, { item_type: string; quantity: number; total_weight: number; total_volume: number }>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const key = item.item_type || 'Unknown'
      const entry = map.get(key) ?? { item_type: key, quantity: 0, total_weight: 0, total_volume: 0 }
      entry.quantity += item.quantity ?? 0
      map.set(key, entry)
    }
  }
  return Array.from(map.values())
}

export const routeTemplateSampleData: RouteTemplateData = {
  plan_date: '2026-02-18',
  stop_count: _sampleOrders.length,
  total_distance: 34.6,
  total_travel_time: '04:15',
  expected_start_time: '08:00',
  expected_end_time: '12:15',
  driver: 'Driver Name',
  item_count: _sampleOrders
    .flatMap((order) => order.items ?? [])
    .reduce((sum, item) => sum + (item.quantity ?? 0), 0),
  total_weight: 224400,
  total_volume: 4_800_000,
  item_type_summary: _deriveItemTypeSummary(_sampleOrders),
  orders: _sampleOrders,
}

// ─── Layout cursor ────────────────────────────────────────────────────────────
// A single mutable `y` cursor plus pagination helpers, shared by every section
// drawer so the sections compose into one flowing document.

export type RouteLayout = {
  y: number
  readonly CW: number
  readonly BOTTOM: number
  readonly widthCm: number
  readonly heightCm: number
  newPage: () => void
  ensureSpace: (needed: number) => void
}

export const createRouteLayout = (
  pdf: jsPDF,
  widthCm: number,
  heightCm: number,
): RouteLayout => {
  const CW = widthCm - 2 * M
  const BOTTOM = heightCm - M

  const layout: RouteLayout = {
    y: M,
    CW,
    BOTTOM,
    widthCm,
    heightCm,
    newPage: () => {
      pdf.addPage([widthCm, heightCm], 'portrait')
      layout.y = M
    },
    // Add a new page only when genuinely needed — guard prevents an infinite
    // loop if a single element exceeds a full page height.
    ensureSpace: (needed: number) => {
      if (layout.y + needed > BOTTOM && layout.y > M + 0.5) layout.newPage()
    },
  }

  return layout
}

const sortedOrders = (data: RouteTemplateData): RouteOrder[] =>
  [...(data.orders ?? [])].sort(
    (a, b) => (a.stop_order ?? Infinity) - (b.stop_order ?? Infinity),
  )

// ─── Section drawers ──────────────────────────────────────────────────────────

export const drawRouteHeader = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
  title: string,
): void => {
  setFont(pdf, FS.title, true, DARK)
  pdf.text(title, M, L.y + capH(FS.title))

  setFont(pdf, FS.date, true, DARK)
  pdf.text(`Plan date: ${safe(data.plan_date)}`, L.widthCm - M, L.y + capH(FS.date) + 0.06, { align: 'right' })

  L.y += capH(FS.title) + 0.18
  drawHLine(pdf, M, L.y, L.widthCm - M, 0.03, 31, 31, 31)
  L.y += GAP
}

export const drawKpiSummary = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
): void => {
  const CW = L.CW
  const FIELD_ROW_H = 0.78
  const BOX_PAD_V = 0.28
  const BOX_H = BOX_PAD_V * 2 + FIELD_ROW_H * 2
  const COL_W = CW / 4

  const summaryFields: [string, string][] = [
    ['STOPS', String(data.stop_count ?? '--')],
    ['DISTANCE', `${fmtNum(data.total_distance)} km`],
    ['TRAVEL TIME', safe(data.total_travel_time)],
    ['DRIVER', safe(data.driver)],
    ['EXPECTED START', safe(data.expected_start_time)],
    ['EXPECTED END', safe(data.expected_end_time)],
    ['ITEMS', String(data.item_count ?? '--')],
    ['WEIGHT / VOLUME', `${formatMetric(data.total_weight ?? 0, 'kg')} / ${fmtVol(data.total_volume ?? 0)}`],
  ]

  pdf.setDrawColor(184, 184, 184)
  pdf.setLineWidth(0.03)
  pdf.roundedRect(M, L.y, CW, BOX_H, 0.18, 0.18, 'S')

  summaryFields.forEach(([label, value], i) => {
    const row = Math.floor(i / 4)
    const col = i % 4
    const fx = M + 0.34 + col * COL_W
    const rowTop = L.y + BOX_PAD_V + row * FIELD_ROW_H

    setFont(pdf, FS.label, false, MUTED)
    pdf.text(label, fx, rowTop + capH(FS.label))

    setFont(pdf, FS.value, true, DARK)
    pdf.text(value, fx, rowTop + 0.38 + capH(FS.value))
  })

  L.y += BOX_H + GAP
}

export const drawStopCards = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
): void => {
  const CW = L.CW
  const orders = sortedOrders(data)

  // Column positions — defined once; used for height pre-calculation and rendering
  const c1 = M + CARD_PAD_H              // Article
  const c2 = M + CARD_PAD_H + CW * 0.18  // Position
  const c3 = M + CARD_PAD_H + CW * 0.32  // Type
  const c4 = M + CARD_PAD_H + CW * 0.52  // Qty
  const c5 = M + CARD_PAD_H + CW * 0.60  // Properties
  const maxPropsW = M + CW - CARD_PAD_H - c5

  for (const order of orders) {
    // Pre-measure each row's property lines so card height is accurate before drawing
    setFont(pdf, FS.table, false, DARK)
    const itemRows = (order.items ?? []).map(item => {
      const propsLines = pdf.splitTextToSize(fmtProps(item.properties), maxPropsW) as string[]
      const rowH = TBL_ROW_H + Math.max(0, propsLines.length - 1) * PROP_LINE_H
      return { item, propsLines, rowH }
    })

    const itemCount = itemRows.length
    const totalItemsH = itemRows.reduce((sum, r) => sum + r.rowH, 0)
    const contentH = itemCount > 0
      ? CONT_PAD_V + TBL_HDR_H + totalItemsH + CONT_PAD_V
      : CONT_PAD_V + 0.32 + CONT_PAD_V
    const cardH = HDR_H + contentH

    L.ensureSpace(cardH + 0.24)

    // Card outline
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.03)
    pdf.roundedRect(M, L.y, CW, cardH, 0.14, 0.14, 'S')

    // Header fill (rect so rounded card border stays on top)
    pdf.setFillColor(244, 245, 247)
    pdf.rect(M, L.y, CW, HDR_H, 'F')

    // Re-stroke card border on top of fill
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.03)
    pdf.roundedRect(M, L.y, CW, cardH, 0.14, 0.14, 'S')

    // Header / content divider
    drawHLine(pdf, M, L.y + HDR_H, M + CW, 0.02, 206, 206, 206)

    // Header text
    const hdrY = L.y + HDR_H / 2 + capH(FS.stopHdr) / 2
    setFont(pdf, FS.stopHdr, true, DARK)
    pdf.text(safe(order.stop_order), M + CARD_PAD_H, hdrY)
    pdf.text(formatRouteOrderIdentity(order), M + CARD_PAD_H + 1.2, hdrY)

    // Address — clip to available space
    const etaText = `ETA ${safe(order.expected_arrival_time)}`
    const etaW = pdf.getTextWidth(etaText) + 0.1
    const addrMaxW = CW - 1.2 - 4.0 - etaW - CARD_PAD_H * 2
    const addrLines = pdf.splitTextToSize(safe(order.client_address), addrMaxW)
    pdf.text(String(addrLines[0] ?? '--'), M + CARD_PAD_H + 1.2 + 4.0, hdrY)
    pdf.text(etaText, M + CW - CARD_PAD_H, hdrY, { align: 'right' })

    // Content area
    const contY = L.y + HDR_H

    if (itemCount > 0) {
      const thY = contY + CONT_PAD_V + capH(FS.table)

      setFont(pdf, FS.table, true, MID)
      pdf.text('Article', c1, thY)
      pdf.text('Position', c2, thY)
      pdf.text('Type', c3, thY)
      pdf.text('Qty', c4, thY)
      pdf.text('Properties', c5, thY)

      drawHLine(pdf, c1, thY + 0.06, M + CW - CARD_PAD_H, 0.015, 215, 215, 215)

      let rowTop = thY + 0.06
      for (const { item, propsLines, rowH } of itemRows) {
        const textY = rowTop + TBL_ROW_H

        setFont(pdf, FS.table, false, DARK)
        pdf.text(safe(item.article_number), c1, textY)
        pdf.text(safe(item.item_position), c2, textY)
        pdf.text(safe(item.item_type), c3, textY)
        pdf.text(safe(item.quantity), c4, textY)

        propsLines.forEach((line, idx) => {
          renderPropsLine(pdf, String(line), c5, textY + idx * PROP_LINE_H)
        })

        drawHLine(pdf, c1, rowTop + rowH + 0.1, M + CW - CARD_PAD_H, 0.01, 236, 236, 236)
        rowTop += rowH
      }
    } else {
      setFont(pdf, FS.table, false, [90, 90, 90])
      pdf.text('No items on this stop.', M + CARD_PAD_H, contY + CONT_PAD_V + capH(FS.table))
    }

    L.y += cardH + 0.40
  }
}

export const drawItemSummary = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
): void => {
  const CW = L.CW
  const summary = data.item_type_summary ?? []
  if (summary.length === 0) return

  // Pre-compute expansion groups per rule so the box height is known before drawing
  const summaryOrders = data.orders ?? []
  const expansionGroupsByItemType = new Map<string, Map<string, number>>()
  let totalExpansionRows = 0
  for (const rule of SUMMARY_EXPANSION_RULES) {
    const groups = buildExpansionGroups(rule, summaryOrders)
    if (groups.size > 0) {
      expansionGroupsByItemType.set(normalizeItemType(rule.itemType), groups)
      totalExpansionRows += groups.size
    }
  }

  const SUM_HDR_H = 0.44
  const SUM_PAD_V = 0.18
  const SUM_TBL_HDR_H = 0.36
  const EXP_ROW_H = 0.38
  const SUM_H = SUM_HDR_H + SUM_PAD_V + SUM_TBL_HDR_H + summary.length * TBL_ROW_H + totalExpansionRows * EXP_ROW_H + SUM_PAD_V

  L.ensureSpace(SUM_H)

  pdf.setDrawColor(184, 184, 184)
  pdf.setLineWidth(0.03)
  pdf.roundedRect(M, L.y, CW, SUM_H, 0.18, 0.18, 'S')

  pdf.setFillColor(244, 245, 247)
  pdf.rect(M, L.y, CW, SUM_HDR_H, 'F')

  pdf.setDrawColor(206, 206, 206)
  pdf.setLineWidth(0.03)
  pdf.roundedRect(M, L.y, CW, SUM_H, 0.18, 0.18, 'S')

  drawHLine(pdf, M, L.y + SUM_HDR_H, M + CW, 0.02, 206, 206, 206)

  setFont(pdf, FS.stopHdr, true, DARK)
  pdf.text('Item Summary', M + 0.24, L.y + SUM_HDR_H / 2 + capH(FS.stopHdr) / 2)

  const sc1 = M + 0.24
  const sc2 = M + 0.24 + CW * 0.44
  const sc3 = M + 0.24 + CW * 0.60
  const sc4 = M + 0.24 + CW * 0.80

  const thY = L.y + SUM_HDR_H + SUM_PAD_V + capH(FS.table)
  setFont(pdf, FS.table, true, MID)
  pdf.text('Item type', sc1, thY)
  pdf.text('Total items', sc2, thY)
  pdf.text('Weight', sc3, thY)
  pdf.text('Volume', sc4, thY)

  drawHLine(pdf, sc1, thY + 0.06, M + CW - 0.24, 0.015, 215, 215, 215)

  let rowY = thY + 0.06
  for (const entry of summary) {
    rowY += TBL_ROW_H
    setFont(pdf, FS.table, false, DARK)
    pdf.text(safe(entry.item_type), sc1, rowY)
    pdf.text(safe(entry.quantity), sc2, rowY)
    pdf.text(formatMetric(entry.total_weight ?? 0, 'kg'), sc3, rowY)
    pdf.text(fmtVol(entry.total_volume ?? 0), sc4, rowY)

    drawHLine(pdf, sc1, rowY + 0.08, M + CW - 0.24, 0.01, 236, 236, 236)

    const expGroups = expansionGroupsByItemType.get(normalizeItemType(entry.item_type ?? ''))
    if (expGroups) {
      const rule = SUMMARY_EXPANSION_RULES.find(
        r => normalizeItemType(r.itemType) === normalizeItemType(entry.item_type ?? ''),
      )
      for (const [groupValue, total] of expGroups) {
        rowY += EXP_ROW_H
        const indent = sc1 + 0.32
        // Nested total reads "{label} {groupValue} : {total}", e.g.
        // "extensions outside : 2".
        const labelText = `${rule?.label ?? 'total'} ${groupValue} : `
        setFont(pdf, FS.propsKey, false, PROP_KEY_CLR)
        const labelW = pdf.getTextWidth(labelText)
        pdf.text(labelText, indent, rowY)
        setFont(pdf, FS.table, false, DARK)
        pdf.text(String(total), indent + labelW, rowY)
        drawHLine(pdf, sc1, rowY + 0.06, M + CW - 0.24, 0.01, 242, 242, 242)
      }
    }
  }

  L.y += SUM_H + GAP
}

export const drawPackByType = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
): void => {
  const CW = L.CW
  const orders = sortedOrders(data)
  const summary = data.item_type_summary ?? []

  // Packer-oriented view: every order-item grouped under its item type so items
  // can be pulled and staged type-by-type instead of scanning each stop card.
  type PackRow = {
    article: string
    qty: string
    qtyNum: number
    position: string
    dest: string
    properties: string
  }

  const packGroups = new Map<string, { label: string; rows: PackRow[] }>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const rawType = (item.item_type ?? '').trim() || 'Unknown'
      const key = normalizeItemType(rawType)
      const group = packGroups.get(key) ?? { label: rawType, rows: [] }
      group.rows.push({
        article: safe(item.article_number),
        qty: safe(item.quantity),
        qtyNum: typeof item.quantity === 'number' ? item.quantity : 0,
        position: safe(item.item_position),
        dest: `${safe(order.stop_order)} · ${formatRouteOrderIdentity(order)}`,
        properties: fmtProps(item.properties),
      })
      packGroups.set(key, group)
    }
  }

  if (packGroups.size === 0) return

  // Render groups in the summary table's order first, then any extra types.
  const packOrder: string[] = []
  const packEmitted = new Set<string>()
  for (const entry of summary) {
    const key = normalizeItemType((entry.item_type ?? '').trim() || 'Unknown')
    if (packGroups.has(key) && !packEmitted.has(key)) {
      packOrder.push(key)
      packEmitted.add(key)
    }
  }
  for (const key of packGroups.keys()) {
    if (!packEmitted.has(key)) {
      packOrder.push(key)
      packEmitted.add(key)
    }
  }

  const kc1 = M + CARD_PAD_H              // Article
  const kc2 = M + CARD_PAD_H + CW * 0.22  // Qty
  const kc3 = M + CARD_PAD_H + CW * 0.30  // Position
  const kc4 = M + CARD_PAD_H + CW * 0.44  // Destination (stop · order)
  const kc5 = M + CARD_PAD_H + CW * 0.62  // Properties
  const kMaxPropsW = M + CW - CARD_PAD_H - kc5

  const PACK_BAR_H = 0.56
  const PACK_ROW_GAP = 0.20                    // breathing room between item rows
  // The pack section renders at its own type scale: the value text drives the
  // size and every surrounding element (headers, group bar, keys, row heights)
  // scales by the same factor so the whole section grows evenly.
  const PACK_VALUE_FS = 9.75                   // ≈ 13px value/cell text
  const PACK_SCALE = PACK_VALUE_FS / FS.table
  const PACK_KEY_FS = FS.propsKey * PACK_SCALE // property keys
  const PACK_HDR_FS = FS.stopHdr * PACK_SCALE  // group bar label
  const PACK_ROW_H = TBL_ROW_H * PACK_SCALE    // base single-line row height
  const PACK_PROP_LINE_H = PROP_LINE_H * PACK_SCALE // extra height per wrapped prop line

  // Section title
  L.ensureSpace(capH(FS.title) + 0.4 + GAP + PACK_BAR_H)
  setFont(pdf, FS.title, true, DARK)
  pdf.text('Pack by Item Type', M, L.y + capH(FS.title))
  L.y += capH(FS.title) + 0.18
  drawHLine(pdf, M, L.y, L.widthCm - M, 0.03, 31, 31, 31)
  L.y += GAP

  // Draws a type header bar + column header row, advancing y below the divider.
  const drawPackTypeHeader = (label: string, totalQty: number, cont: boolean) => {
    pdf.setFillColor(244, 245, 247)
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.02)
    pdf.roundedRect(M, L.y, CW, PACK_BAR_H, 0.12, 0.12, 'FD')

    const barBaseY = L.y + PACK_BAR_H / 2 + capH(PACK_HDR_FS) / 2
    setFont(pdf, PACK_HDR_FS, true, DARK)
    pdf.text(cont ? `${label} (cont.)` : label, M + CARD_PAD_H, barBaseY)
    setFont(pdf, PACK_VALUE_FS, true, MID)
    pdf.text(
      `${totalQty} item${totalQty === 1 ? '' : 's'}`,
      M + CW - CARD_PAD_H,
      barBaseY,
      { align: 'right' },
    )
    L.y += PACK_BAR_H

    const colBaseY = L.y + CONT_PAD_V + capH(PACK_VALUE_FS)
    setFont(pdf, PACK_VALUE_FS, true, MID)
    pdf.text('Article', kc1, colBaseY)
    pdf.text('Qty', kc2, colBaseY)
    pdf.text('Position', kc3, colBaseY)
    pdf.text('Order', kc4, colBaseY)
    pdf.text('Properties', kc5, colBaseY)
    L.y = colBaseY + 0.06
    drawHLine(pdf, kc1, L.y, M + CW - CARD_PAD_H, 0.015, 215, 215, 215)
  }

  for (const key of packOrder) {
    const group = packGroups.get(key)
    if (!group) continue
    const totalQty = group.rows.reduce((sum, r) => sum + r.qtyNum, 0)

    // Keep the type header attached to at least its first row.
    L.ensureSpace(
      PACK_BAR_H + CONT_PAD_V + capH(PACK_VALUE_FS) + 0.06 + PACK_ROW_H + 0.2,
    )
    drawPackTypeHeader(group.label, totalQty, false)

    for (const row of group.rows) {
      setFont(pdf, PACK_VALUE_FS, false, DARK)
      const propsLines = pdf.splitTextToSize(row.properties, kMaxPropsW) as string[]
      const rowH = PACK_ROW_H + Math.max(0, propsLines.length - 1) * PACK_PROP_LINE_H

      if (L.y + rowH + PACK_ROW_GAP + 0.14 > L.BOTTOM) {
        L.newPage()
        drawPackTypeHeader(group.label, totalQty, true)
      }

      const textY = L.y + PACK_ROW_H
      setFont(pdf, PACK_VALUE_FS, false, DARK)
      pdf.text(row.article, kc1, textY)
      pdf.text(row.qty, kc2, textY)
      pdf.text(row.position, kc3, textY)
      pdf.text(row.dest, kc4, textY)
      propsLines.forEach((line, idx) => {
        renderPropsLine(pdf, String(line), kc5, textY + idx * PACK_PROP_LINE_H, PACK_VALUE_FS, PACK_KEY_FS)
      })
      drawHLine(pdf, kc1, L.y + rowH + 0.1, M + CW - CARD_PAD_H, 0.01, 236, 236, 236)
      L.y += rowH + PACK_ROW_GAP
    }

    L.y += GAP
  }
}

export const drawOrderNotes = (
  pdf: jsPDF,
  L: RouteLayout,
  data: RouteTemplateData,
): void => {
  const CW = L.CW
  const blocks = sortedOrders(data)
    .map((order) => ({
      title: `${safe(order.stop_order)} · ${formatRouteOrderIdentity(order)}`,
      notes: extractOrderNotes(order),
    }))
    .filter((block) => block.notes.length > 0)

  if (blocks.length === 0) return

  const NOTES_BAR_H = 0.56
  const NOTE_LINE_H = capH(FS.table) + 0.18
  const labelX = M + CARD_PAD_H
  const notesMaxW = CW - CARD_PAD_H * 2

  // Section title
  L.ensureSpace(capH(FS.title) + 0.4 + GAP + NOTES_BAR_H + CONT_PAD_V + NOTE_LINE_H)
  setFont(pdf, FS.title, true, DARK)
  pdf.text('Order Notes', M, L.y + capH(FS.title))
  L.y += capH(FS.title) + 0.18
  drawHLine(pdf, M, L.y, L.widthCm - M, 0.03, 31, 31, 31)
  L.y += GAP

  // Order header bar, advancing y just below the bar.
  const drawNotesOrderBar = (title: string, cont: boolean) => {
    pdf.setFillColor(244, 245, 247)
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.02)
    pdf.roundedRect(M, L.y, CW, NOTES_BAR_H, 0.12, 0.12, 'FD')

    const barBaseY = L.y + NOTES_BAR_H / 2 + capH(FS.stopHdr) / 2
    setFont(pdf, FS.stopHdr, true, DARK)
    pdf.text(cont ? `${title} (cont.)` : title, M + CARD_PAD_H, barBaseY)
    L.y += NOTES_BAR_H + CONT_PAD_V
  }

  for (const block of blocks) {
    L.ensureSpace(NOTES_BAR_H + CONT_PAD_V + NOTE_LINE_H + 0.2)
    drawNotesOrderBar(block.title, false)

    for (const note of block.notes) {
      const labelText = `${note.label}: `
      setFont(pdf, FS.table, true, MID)
      const labelW = pdf.getTextWidth(labelText)

      setFont(pdf, FS.table, false, DARK)
      const lines = pdf.splitTextToSize(note.content, notesMaxW - labelW) as string[]
      const shown = lines.length ? lines : ['--']
      const noteH = shown.length * NOTE_LINE_H

      // Break to a new page, re-labelling the order it belongs to.
      if (L.y + noteH + 0.1 > L.BOTTOM) {
        L.newPage()
        drawNotesOrderBar(block.title, true)
      }

      const baseY = L.y + capH(FS.table)
      setFont(pdf, FS.table, true, MID)
      pdf.text(labelText, labelX, baseY)
      setFont(pdf, FS.table, false, DARK)
      shown.forEach((line, idx) => {
        pdf.text(String(line), labelX + labelW, baseY + idx * NOTE_LINE_H)
      })
      L.y += noteH
    }

    L.y += GAP
  }
}
