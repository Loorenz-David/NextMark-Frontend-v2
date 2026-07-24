/**
 * Mirrors `Delivery_app_BK/services/domain/client_form/media_placement.py`.
 * The backend rejects any other value on write and on `GET /media?placement=…`.
 */
export const MEDIA_PLACEMENTS = [
  'carousel',
  'sidebar_left',
  'sidebar_right',
] as const

export type MediaPlacement = (typeof MEDIA_PLACEMENTS)[number]

export const MEDIA_PLACEMENT_LABELS: Record<MediaPlacement, string> = {
  carousel: 'Carousel',
  sidebar_left: 'Left sidebar',
  sidebar_right: 'Right sidebar',
}

export const MEDIA_PLACEMENT_DESCRIPTIONS: Record<MediaPlacement, string> = {
  carousel: 'Rotating gallery beside the form content.',
  sidebar_left: 'Shown to the left of the form.',
  sidebar_right: 'Shown to the right of the form.',
}

export const isMediaPlacement = (value: unknown): value is MediaPlacement =>
  typeof value === 'string' && (MEDIA_PLACEMENTS as readonly string[]).includes(value)
