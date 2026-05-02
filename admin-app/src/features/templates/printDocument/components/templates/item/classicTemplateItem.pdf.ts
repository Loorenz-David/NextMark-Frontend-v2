import type { jsPDF } from 'jspdf'

type ClassicItemData = {
  delivery_date?: string | null
  order_scalar_id?: number | null
  article_number?: string | null
  reference_number?: string | null
  item_type?: string | null
  quantity?: number | null
  properties?: Record<string, unknown> | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const safe = (v: unknown): string => {
  if (v == null) return '--'
  const s = String(v).trim()
  return s || '--'
}

// Distance from baseline to top of capital letter (cm).
// baseline = boxCenter + capH(pt)/2 to visually centre text in a box.
const capH = (pt: number) => pt * 0.026

const DARK: [number, number, number] = [17, 17, 17]
const MUTED: [number, number, number] = [97, 97, 97]

const FS = {
  date: 8,
  order: 7,
  name: 8,
  props: 6,
} as const

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

function drawHLine(
  pdf: jsPDF,
  x1: number,
  y: number,
  x2: number,
  w: number,
  r: number,
  g: number,
  b: number,
) {
  pdf.setDrawColor(r, g, b)
  pdf.setLineWidth(w)
  pdf.line(x1, y, x2, y)
}

const fmtWeek = (dateInput?: string | null): string => {
  if (!dateInput) return 'v --'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return 'v --'
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `v ${weekNo}`
}

const fmtItemProps = (properties?: Record<string, unknown> | null): string => {
  if (!properties) return '--'
  const parts: string[] = []
  for (const [k, v] of Object.entries(properties)) {
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

// ─── Sample data for preview ────────────────────────────────────────────────

export const classicTemplateItemSampleData = {
  itemPayload: {
    delivery_date: '2026-01-01',
    item_type: 'Bookshelf',
    order_scalar_id: 1324,
    article_number: '2345324534',
    properties: [
      { name: 'keys', value: 'included' },
      { name: 'levels', value: '5' },
      { name: 'color', value: 'Natural Oak' },
      { name: 'assembly', value: 'required' },
    ],
    quantity: 12,
  },
}

// ─── Layout constants (cm) ──────────────────────────────────────────────────

const PAD_H = 0.22
const PAD_V = 0.18
const ROW1_H = 0.78
const ROW2_H = 1.68
const ROW3_H = 1.6

// ─── Public draw function ────────────────────────────────────────────────────

export const drawClassicTemplateItem = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const wrapper = rawData as { itemPayload?: ClassicItemData }
  const data: ClassicItemData = wrapper.itemPayload ?? (rawData as ClassicItemData)
  const W = widthCm
  const H = heightCm

  const r2y = ROW1_H
  const r3y = ROW1_H + ROW2_H
  const r4y = ROW1_H + ROW2_H + ROW3_H

  // Outer border
  pdf.setDrawColor(152, 152, 152)
  pdf.setLineWidth(0.015)
  pdf.rect(0, 0, W, H, 'S')

  // ─── Row 1: Date / Week ───────────────────────────────────────────────────
  const dateLabel = data.delivery_date ?? 'missing date'
  const weekLabel = fmtWeek(data.delivery_date)
  const r1BaseY = ROW1_H / 2 + capH(FS.date) / 2

  setFont(pdf, FS.date, false, DARK)
  pdf.text(dateLabel, PAD_H, r1BaseY)
  setFont(pdf, FS.date, true, DARK)
  pdf.text(weekLabel, W - PAD_H, r1BaseY, { align: 'right' })

  drawHLine(pdf, 0, r2y, W, 0.025, 17, 17, 17)

  // ─── Row 2: Order / Item ──────────────────────────────────────────────────
  const orderLabel = data.order_scalar_id != null ? `# ${data.order_scalar_id}` : '--'
  const itemLabel = safe(data.article_number || data.reference_number)

  const r2CenterY = r2y + ROW2_H / 2
  const subGap = 0.38
  const sub1BaseY = r2CenterY - subGap / 2 + capH(FS.order) / 2
  const sub2BaseY = r2CenterY + subGap / 2 + capH(FS.order) / 2

  setFont(pdf, FS.order, true, DARK)
  pdf.text('Order:', PAD_H, sub1BaseY)
  setFont(pdf, FS.order, false, DARK)
  pdf.text(orderLabel, W - PAD_H, sub1BaseY, { align: 'right' })

  setFont(pdf, FS.order, true, DARK)
  pdf.text('Item:', PAD_H, sub2BaseY)
  setFont(pdf, FS.order, false, DARK)
  pdf.text(itemLabel, W - PAD_H, sub2BaseY, { align: 'right' })

  drawHLine(pdf, 0, r3y, W, 0.025, 17, 17, 17)

  // ─── Row 3: Name / Qty / Properties ──────────────────────────────────────
  const nameLabel = safe(data.item_type)
  const qtyLabel = `${safe(data.quantity)} . qua`
  const propsLabel = fmtItemProps(data.properties)

  const ROW3_PAD_V = 0.2
  const nameBaseY = r3y + ROW3_PAD_V + capH(FS.name)

  setFont(pdf, FS.name, false, DARK)
  const qtyW = pdf.getTextWidth(qtyLabel) + 0.08
  const nameMaxW = W - 2 * PAD_H - qtyW - 0.1
  const nameLines = pdf.splitTextToSize(nameLabel, nameMaxW)
  pdf.text(String(nameLines[0] ?? '--'), PAD_H, nameBaseY)
  pdf.text(qtyLabel, W - PAD_H, nameBaseY, { align: 'right' })

  setFont(pdf, FS.props, false, MUTED)
  const propsStartY = nameBaseY + 0.2
  const propLineH = capH(FS.props) + 0.1
  const availablePropsH = r4y - propsStartY - 0.08
  const maxPropsLines = Math.max(1, Math.floor(availablePropsH / propLineH))
  const propsLines = pdf.splitTextToSize(propsLabel, W - 2 * PAD_H) as string[]
  propsLines.slice(0, maxPropsLines).forEach((line, idx) => {
    pdf.text(String(line), PAD_H, propsStartY + capH(FS.props) + idx * propLineH)
  })

  drawHLine(pdf, 0, r4y, W, 0.025, 17, 17, 17)

  // ─── Row 4: Barcode placeholder ───────────────────────────────────────────
  const barcodeH = 1.45
  const barcodeTop = H - PAD_V - barcodeH
  pdf.setDrawColor(17, 17, 17)
  pdf.setLineWidth(0.025)
  pdf.roundedRect(PAD_H, barcodeTop, W - 2 * PAD_H, barcodeH, 0.26, 0.26, 'S')
}
