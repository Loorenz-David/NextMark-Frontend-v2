import type { jsPDF } from 'jspdf'

type SevenByTenItemData = {
  delivery_date?: string | null
  order_scalar_id?: number | null
  article_number?: string | null
  reference_number?: string | null
  item_type?: string | null
  quantity?: number | null
  properties?: Record<string, unknown> | null
  order_notes?: unknown
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
const MID: [number, number, number] = [55, 55, 55]

const FS = {
  header: 15,
  week: 29,
  article: 14,
  type: 11,
  props: 9,
  notesLabel: 8,
  notesValue: 9,
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

const fmtDateLabel = (dateInput?: string | null): string => {
  const s = safe(dateInput)
  return s === '--' ? 'missing date' : s.replaceAll('-', '.')
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
  return parts.length ? parts.join('   ·   ') : '--'
}

const fmtOrderNotes = (notes: unknown): string => {
  const entries = Array.isArray(notes) ? notes : notes != null ? [notes] : []
  const general = entries
    .map((note) => {
      if (typeof note === 'string') return note.trim()
      if (!note || typeof note !== 'object') return ''
      const typed = note as { content?: unknown; type?: unknown }
      if (String(typed.type ?? 'GENERAL').toUpperCase() !== 'GENERAL') return ''
      return typeof typed.content === 'string' ? typed.content.trim() : ''
    })
    .filter(Boolean)
  return general.length ? general.join(' ') : '--'
}

// ─── Sample data for preview ────────────────────────────────────────────────

export const sevenByTenTemplateItemSampleData = {
  itemPayload: {
    delivery_date: '2026-05-03',
    item_type: 'Dining Chair',
    order_scalar_id: 1324,
    article_number: 'A-1048',
    properties: { set: 'of 4' },
    order_notes: [{ type: 'GENERAL', content: 'Deliver through the side entrance.' }],
    quantity: 1,
  },
}

// ─── Layout constants (cm) ──────────────────────────────────────────────────

const PAD = 0.18   // top / bottom
const PAD_H = 0.2  // left / right
const PAD_INNER_L = 0.06  // additional left padding inside row-4 text block

const ROW1_H = 0.86
const ROW2_H = 1.28
const ROW3_H = 0.82

const BARCODE_W = 3.62
const BARCODE_H = 2.62

// ─── Public draw function ────────────────────────────────────────────────────

export const drawSevenByTenTemplateItem = (
  pdf: jsPDF,
  rawData: unknown,
  widthCm: number,
  heightCm: number,
): void => {
  const wrapper = rawData as { itemPayload?: SevenByTenItemData }
  const data: SevenByTenItemData = wrapper.itemPayload ?? (rawData as SevenByTenItemData)
  const W = widthCm
  const H = heightCm

  const r1y = PAD
  const r2y = r1y + ROW1_H
  const r3y = r2y + ROW2_H
  const r4y = r3y + ROW3_H
  const r4bottom = H - PAD

  // Outer border
  pdf.setDrawColor(17, 17, 17)
  pdf.setLineWidth(0.025)
  pdf.rect(0, 0, W, H, 'S')

  // ─── Row 1: Id + Date ─────────────────────────────────────────────────────
  const idText = `Id: ${data.order_scalar_id != null ? String(data.order_scalar_id) : '--'}`
  const dateText = fmtDateLabel(data.delivery_date)
  const r1BaseY = r1y + ROW1_H / 2 + capH(FS.header) / 2
  const midX = W / 2
  const halfGap = 0.36 // gap 0.72cm / 2

  setFont(pdf, FS.header, true, DARK)
  pdf.text(idText, midX - halfGap, r1BaseY, { align: 'right' })
  pdf.text(dateText, midX + halfGap, r1BaseY, { align: 'left' })

  // ─── Row 2: Large week label ───────────────────────────────────────────────
  const weekText = fmtWeek(data.delivery_date)
  const r2BaseY = r2y + ROW2_H / 2 + capH(FS.week) / 2

  setFont(pdf, FS.week, true, DARK)
  pdf.text(weekText, midX, r2BaseY, { align: 'center' })

  // ─── Row 3: Art + Article number ──────────────────────────────────────────
  const articleText = safe(data.article_number || data.reference_number)
  const r3BaseY = r3y + ROW3_H / 2 + capH(FS.article) / 2
  const artHalfGap = 0.13

  setFont(pdf, FS.article, true, DARK)
  pdf.text('Art:', midX - artHalfGap, r3BaseY, { align: 'right' })
  pdf.text(articleText, midX + artHalfGap, r3BaseY, { align: 'left' })

  // ─── Row 4: Left text block + Right barcode placeholder ───────────────────
  const barcodeX = W - PAD_H - BARCODE_W
  const barcodeTop = r4bottom - BARCODE_H

  pdf.setDrawColor(17, 17, 17)
  pdf.setLineWidth(0.025)
  pdf.rect(barcodeX, barcodeTop, BARCODE_W, BARCODE_H, 'S')

  const textLeft = PAD_H + PAD_INNER_L
  const textMaxW = barcodeX - PAD_H - textLeft - 0.1
  const textStartY = r4y + 0.1

  // Type
  const typeLabel = safe(data.item_type)
  const typeBaseY = textStartY + 0.9 / 2 + capH(FS.type) / 2

  setFont(pdf, FS.type, false, DARK)
  const typeLines = pdf.splitTextToSize(typeLabel, textMaxW)
  pdf.text(String(typeLines[0] ?? '--'), textLeft, typeBaseY)

  // Properties (up to 2 lines)
  const propsLabel = fmtItemProps(data.properties)
  const propsStartY = textStartY + 0.9
  const propsLineH = 0.54
  const propsLine1BaseY = propsStartY + propsLineH / 2 + capH(FS.props) / 2
  const propsLine2BaseY = propsLine1BaseY + propsLineH

  setFont(pdf, FS.props, false, MID)
  const propsLines = pdf.splitTextToSize(propsLabel, textMaxW)
  pdf.text(String(propsLines[0] ?? '--'), textLeft, propsLine1BaseY)
  if (propsLines.length > 1) {
    pdf.text(String(propsLines[1]), textLeft, propsLine2BaseY)
  }

  // Notes
  const notesStartY = propsStartY + propsLineH * 2 + 0.26
  const notesBaseY = notesStartY + capH(FS.notesValue) / 2

  setFont(pdf, FS.notesLabel, true, DARK)
  const notesLabelW = pdf.getTextWidth('Notes:') + 0.08
  pdf.text('Notes:', textLeft, notesBaseY)

  setFont(pdf, FS.notesValue, false, MID)
  const notesText = fmtOrderNotes(data.order_notes)
  const notesValueLines = pdf.splitTextToSize(notesText, textMaxW - notesLabelW - 0.1)
  pdf.text(String(notesValueLines[0] ?? '--'), textLeft + notesLabelW + 0.1, notesBaseY)
}
