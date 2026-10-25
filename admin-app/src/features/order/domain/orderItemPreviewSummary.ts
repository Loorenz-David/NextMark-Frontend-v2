import type { OrderItemPreview } from '../types/order'

export const resolveOrderItemPreviewSummary = (
  previews: OrderItemPreview[] | null | undefined,
  totalItems: number,
  maxRows = 2,
) => {
  const rows = (previews ?? []).slice(0, Math.max(0, maxRows))
  const previewedUnits = rows.reduce(
    (sum, preview) => sum + (preview.quantity ?? 1),
    0,
  )

  return { rows, extraCount: Math.max(0, totalItems - previewedUnits) }
}
