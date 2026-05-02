import type { jsPDF } from 'jspdf'

import { formatMetric } from '@shared-utils'
import type { availableOrientations } from '@/features/templates/printDocument/types'

type RouteItem = {
  article_number?: string | null
  item_position?: string | null
  item_type?: string | null
  quantity?: number | null
  properties?: Record<string, unknown> | Array<{ name?: string | null; value?: unknown }> | null
}

type RouteOrder = {
  stop_order?: number | null
  order_scalar_id?: number | null
  client_address?: string | null
  expected_arrival_time?: string | null
  items?: RouteItem[] | null
}

type RouteSummaryEntry = {
  item_type?: string | null
  quantity?: number | null
  total_weight?: number | null
  total_volume?: number | null
}

export type ClassicTemplateRouteData = {
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

type RouteData = ClassicTemplateRouteData

// ─── Summary expansion rules ─────────────────────────────────────────────────
// Each rule adds property sub-totals beneath a specific item type in the
// item summary section. Add or remove entries as needed.

// Add or remove entries to control which item types render property sub-totals
// in the item summary section.
type SummaryExpansionRule = {
  itemType: string
  groupByProperty: string
  sumProperty: string
}

const SUMMARY_EXPANSION_RULES: SummaryExpansionRule[] = [
  {
    itemType: 'Dining tables',
    groupByProperty: 'extension_type',
    sumProperty: 'number_of_extensions',
  },
]

// ─── Sample data for preview ────────────────────────────────────────────────

const _sampleOrders: RouteOrder[] = [
  {
    stop_order: 1,
    order_scalar_id: 10234,
    client_address: '14 North Bridge Ave',
    expected_arrival_time: '08:45',
    items: [
      { article_number: 'A-9932', item_position: 'DL1', item_type: 'Dining Chair', quantity: 4, properties: { color: 'Oak', floor: 2 } },
      { article_number: 'B-1109', item_position: 'DT2', item_type: 'Dining tables', quantity: 1, properties: { size: '180x90', extention_type: 'outside', number_of_extentions: 2 } },
    ],
  },
  {
    stop_order: 2,
    order_scalar_id: 10235,
    client_address: '8B Lake Park Road',
    expected_arrival_time: '09:20',
    items: [
      { article_number: 'C-4311', item_position: 'BK3', item_type: 'Dining tables', quantity: 1, properties: { size: '160x80', extention_type: 'inside', number_of_extentions: 1 } },
      { article_number: 'D-0982', item_position: 'SF1', item_type: 'Bookshelf', quantity: 2, properties: { levels: 5 } },
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

export const classicTemplateRouteSampleData = {
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const safe = (v: unknown): string => {
  if (v == null) return '--'
  const s = String(v).trim()
  return s || '--'
}

const fmtNum = (v: number | null | undefined): string => {
  if (typeof v !== 'number' || Number.isNaN(v)) return '--'
  return Number.isInteger(v) ? String(v) : v.toFixed(2)
}

// formatMetric normalises volume to '㎥' (U+33A5) which is outside Latin-1.
// jsPDF built-in Helvetica is Latin-1 only, so we format volume locally using
// the superscript-3 character U+00B3 ('³') which is Latin-1 safe.
const fmtVol = (v: number): string => {
  const m3 = Number.isFinite(v) ? v / 1_000_000 : 0
  return `${Number(m3.toFixed(2))} m³`
}

const fmtProps = (props?: RouteItem['properties']): string => {
  if (!props) return '--'

  if (Array.isArray(props)) {
    const parts = props
      .map((property) => {
        const key = typeof property?.name === 'string' ? property.name.trim() : ''
        const value = property?.value
        if (!key || value == null) return null
        return `${key}: ${String(value)}`
      })
      .filter((part): part is string => Boolean(part))
    return parts.length ? parts.join(' · ') : '--'
  }

  const parts: string[] = []
  for (const [k, v] of Object.entries(props)) {
    if (k.toLowerCase() === 'notes') continue
    if (v == null) continue
    if (typeof v === 'object') {
      const rec = v as Record<string, unknown>
      if ('name' in rec && 'value' in rec) {
        parts.push(`${String(rec.name)}: ${String(rec.value)}`)
      } else {
        const nested = Object.values(rec).map(String).join(', ')
        if (nested) parts.push(`${k}: ${nested}`)
      }
    } else {
      parts.push(`${k}: ${String(v)}`)
    }
  }
  return parts.length ? parts.join(' · ') : '--'
}

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
  if (!properties) {
    return undefined
  }

  const normalizedPropertyKey = normalizePropertyKey(propertyKey)

  if (Array.isArray(properties)) {
    const entry = properties.find((property) => {
      const propertyName = typeof property?.name === 'string' ? property.name : ''
      return normalizePropertyKey(propertyName) === normalizedPropertyKey
    })
    return entry?.value
  }

  for (const [key, value] of Object.entries(properties)) {
    if (normalizePropertyKey(key) === normalizedPropertyKey) {
      return value
    }
  }

  return undefined
}

// Distance from baseline to top of capital letter (in cm).
// Used to vertically centre text: baseline = boxTop + boxH/2 + capH(pt)/2
const capH = (pt: number) => pt * 0.026

// ─── Layout constants (cm) ──────────────────────────────────────────────────

const M = 0.9     // page margin
const GAP = 0.45  // vertical gap between sections

const FS = {
  title: 15,
  date: 9,
  label: 7,
  value: 10,
  stopHdr: 9,
  table: 7,
  propsKey: 5.5,
} as const

// ─── Drawing helpers ────────────────────────────────────────────────────────

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

const DARK: [number, number, number] = [26, 26, 26]
const MID: [number, number, number] = [85, 85, 85]
const MUTED: [number, number, number] = [97, 97, 97]
const PROP_KEY_CLR: [number, number, number] = [158, 158, 158]
const PROP_SEP_CLR: [number, number, number] = [190, 190, 190]

function drawHLine(pdf: jsPDF, x1: number, y: number, x2: number, w: number, r: number, g: number, b: number) {
  pdf.setDrawColor(r, g, b)
  pdf.setLineWidth(w)
  pdf.line(x1, y, x2, y)
}

function renderPropsLine(pdf: jsPDF, lineText: string, x: number, y: number): void {
  const segments = lineText.split(' · ')
  let cx = x
  segments.forEach((seg, i) => {
    if (i > 0) {
      setFont(pdf, FS.table, false, PROP_SEP_CLR)
      const sepW = pdf.getTextWidth(' · ')
      pdf.text(' · ', cx, y)
      cx += sepW
    }
    const colonIdx = seg.indexOf(': ')
    if (colonIdx > -1) {
      const keyPart = seg.slice(0, colonIdx) + ':'
      const valuePart = seg.slice(colonIdx + 2)
      setFont(pdf, FS.propsKey, false, PROP_KEY_CLR)
      pdf.text(keyPart, cx, y)
      cx += pdf.getTextWidth(keyPart)
      setFont(pdf, FS.table, false, DARK)
      pdf.text(' ' + valuePart, cx, y)
      cx += pdf.getTextWidth(' ' + valuePart)
    } else {
      setFont(pdf, FS.table, false, DARK)
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
  console.log('[expansion] rule:', rule.itemType, '| orders count:', orders.length)
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const typeMatch = (item.item_type ?? '').trim() === rule.itemType.trim()
      console.log('[expansion] item_type:', JSON.stringify(item.item_type), '| match:', typeMatch, '| props:', JSON.stringify(item.properties))
      if (!typeMatch) continue
      const props = item.properties
      if (!props) continue
      const groupVal = getItemPropertyValue(props, rule.groupByProperty)
      const addVal = Number(getItemPropertyValue(props, rule.sumProperty) ?? 0)
      console.log('[expansion] groupVal:', groupVal, '| sumVal:', addVal)
      if (groupVal == null) continue
      const groupStr = String(groupVal).trim()
      if (!groupStr) continue
      groups.set(groupStr, (groups.get(groupStr) ?? 0) + (Number.isFinite(addVal) ? addVal : 0))
    }
  }
  console.log('[expansion] result groups:', Object.fromEntries(groups))
  return groups
}

// ─── Public draw function ────────────────────────────────────────────────────

export const drawClassicTemplateRoute = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const data = rawData as RouteData
  const CW = widthCm - 2 * M
  const BOTTOM = heightCm - M

  let y = M

  const newPage = () => {
    pdf.addPage([widthCm, heightCm], 'portrait')
    y = M
  }

  // Add a new page only when genuinely needed — guard prevents infinite loop
  // if a single element exceeds a full page height.
  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM && y > M + 0.5) newPage()
  }

  const orders = [...(data.orders ?? [])].sort(
    (a, b) => (a.stop_order ?? Infinity) - (b.stop_order ?? Infinity),
  )

  // ─── Header ───────────────────────────────────────────────────────────────
  setFont(pdf, FS.title, true, DARK)
  pdf.text('Route Logistics List', M, y + capH(FS.title))

  setFont(pdf, FS.date, true, DARK)
  pdf.text(`Plan date: ${safe(data.plan_date)}`, widthCm - M, y + capH(FS.date) + 0.06, { align: 'right' })

  y += capH(FS.title) + 0.18

  drawHLine(pdf, M, y, widthCm - M, 0.03, 31, 31, 31)
  y += GAP

  // ─── Summary box ──────────────────────────────────────────────────────────
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
  pdf.roundedRect(M, y, CW, BOX_H, 0.18, 0.18, 'S')

  summaryFields.forEach(([label, value], i) => {
    const row = Math.floor(i / 4)
    const col = i % 4
    const fx = M + 0.34 + col * COL_W
    const rowTop = y + BOX_PAD_V + row * FIELD_ROW_H

    setFont(pdf, FS.label, false, MUTED)
    pdf.text(label, fx, rowTop + capH(FS.label))

    setFont(pdf, FS.value, true, DARK)
    pdf.text(value, fx, rowTop + 0.38 + capH(FS.value))
  })

  y += BOX_H + GAP

  // ─── Stop cards ───────────────────────────────────────────────────────────
  const HDR_H = 0.58        // stop header row height
  const CARD_PAD_H = 0.2    // horizontal padding inside card
  const TBL_HDR_H = 0.36    // table header height
  const TBL_ROW_H = 0.48    // base row height (single line)
  const PROP_LINE_H = 0.22  // extra height per additional properties line
  const CONT_PAD_V = 0.18   // vertical padding in content area

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

    ensureSpace(cardH + 0.24)

    // Card outline
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.03)
    pdf.roundedRect(M, y, CW, cardH, 0.14, 0.14, 'S')

    // Header fill (rect so rounded card border stays on top)
    pdf.setFillColor(244, 245, 247)
    pdf.rect(M, y, CW, HDR_H, 'F')

    // Re-stroke card border on top of fill
    pdf.setDrawColor(206, 206, 206)
    pdf.setLineWidth(0.03)
    pdf.roundedRect(M, y, CW, cardH, 0.14, 0.14, 'S')

    // Header / content divider
    drawHLine(pdf, M, y + HDR_H, M + CW, 0.02, 206, 206, 206)

    // Header text
    const hdrY = y + HDR_H / 2 + capH(FS.stopHdr) / 2
    setFont(pdf, FS.stopHdr, true, DARK)
    pdf.text(safe(order.stop_order), M + CARD_PAD_H, hdrY)
    pdf.text(`#${order.order_scalar_id ?? '—'}`, M + CARD_PAD_H + 1.2, hdrY)

    // Address — clip to available space
    const etaText = `ETA ${safe(order.expected_arrival_time)}`
    const etaW = pdf.getTextWidth(etaText) + 0.1
    const addrMaxW = CW - 1.2 - 4.0 - etaW - CARD_PAD_H * 2
    const addrLines = pdf.splitTextToSize(safe(order.client_address), addrMaxW)
    pdf.text(String(addrLines[0] ?? '--'), M + CARD_PAD_H + 1.2 + 4.0, hdrY)
    pdf.text(etaText, M + CW - CARD_PAD_H, hdrY, { align: 'right' })

    // Content area
    const contY = y + HDR_H

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

    y += cardH + 0.40
  }

  // ─── Item summary ─────────────────────────────────────────────────────────
  const summary = data.item_type_summary ?? []
  if (summary.length === 0) return

  // Pre-compute expansion groups per rule so the box height is known before drawing
  const summaryOrders = data.orders ?? []
  const expansionGroupsByItemType = new Map<string, Map<string, number>>()
  let totalExpansionRows = 0
  for (const rule of SUMMARY_EXPANSION_RULES) {
    const groups = buildExpansionGroups(rule, summaryOrders)
    if (groups.size > 0) {
      expansionGroupsByItemType.set(rule.itemType.trim(), groups)
      totalExpansionRows += groups.size
    }
  }

  const SUM_HDR_H = 0.44
  const SUM_PAD_V = 0.18
  const SUM_TBL_HDR_H = 0.36
  const EXP_ROW_H = 0.38
  const SUM_H = SUM_HDR_H + SUM_PAD_V + SUM_TBL_HDR_H + summary.length * TBL_ROW_H + totalExpansionRows * EXP_ROW_H + SUM_PAD_V

  ensureSpace(SUM_H)

  pdf.setDrawColor(184, 184, 184)
  pdf.setLineWidth(0.03)
  pdf.roundedRect(M, y, CW, SUM_H, 0.18, 0.18, 'S')

  pdf.setFillColor(244, 245, 247)
  pdf.rect(M, y, CW, SUM_HDR_H, 'F')

  pdf.setDrawColor(206, 206, 206)
  pdf.setLineWidth(0.03)
  pdf.roundedRect(M, y, CW, SUM_H, 0.18, 0.18, 'S')

  drawHLine(pdf, M, y + SUM_HDR_H, M + CW, 0.02, 206, 206, 206)

  setFont(pdf, FS.stopHdr, true, DARK)
  pdf.text('Item Summary', M + 0.24, y + SUM_HDR_H / 2 + capH(FS.stopHdr) / 2)

  const sc1 = M + 0.24
  const sc2 = M + 0.24 + CW * 0.44
  const sc3 = M + 0.24 + CW * 0.60
  const sc4 = M + 0.24 + CW * 0.80

  const thY = y + SUM_HDR_H + SUM_PAD_V + capH(FS.table)
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

    const expGroups = expansionGroupsByItemType.get((entry.item_type ?? '').trim())
    if (expGroups) {
      for (const [groupValue, total] of expGroups) {
        rowY += EXP_ROW_H
        const indent = sc1 + 0.32
        const rule = SUMMARY_EXPANSION_RULES.find(r => r.itemType.trim() === (entry.item_type ?? '').trim())
        const keyText = (rule?.groupByProperty ?? 'property') + ':'
        setFont(pdf, FS.propsKey, false, PROP_KEY_CLR)
        const keyW = pdf.getTextWidth(keyText)
        pdf.text(keyText, indent, rowY)
        setFont(pdf, FS.table, false, DARK)
        pdf.text(' ' + groupValue, indent + keyW, rowY)
        pdf.text(String(total), sc2, rowY)
        drawHLine(pdf, sc1, rowY + 0.06, M + CW - 0.24, 0.01, 242, 242, 242)
      }
    }
  }
}
