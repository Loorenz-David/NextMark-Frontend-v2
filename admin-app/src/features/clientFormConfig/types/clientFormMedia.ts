import type { MediaPlacement } from '../domain/mediaPlacement'

export type ClientFormMedia = {
  id?: number
  client_id: string
  placement: MediaPlacement
  /** 0-based **within its placement** — two placements may both hold a `0`. */
  position: number
  enabled: boolean
  url: string
  /** Screen-reader text for the `alt` attribute. Never rendered as visible copy. */
  alt_text: string | null
  link_url: string | null
  /** Visible heading rendered above the image. Distinct from `alt_text`. */
  title: string | null
  description: string | null
}

export type ClientFormMediaMap = {
  byClientId: Record<string, ClientFormMedia>
  allIds: string[]
}

/** `position` is deliberately absent — the backend appends within the placement. */
export type ClientFormMediaCreateFields = {
  client_id: string
  placement: MediaPlacement
  url: string
  enabled?: boolean
  alt_text?: string | null
  link_url?: string | null
  title?: string | null
  description?: string | null
}

export type ClientFormMediaUpdateFields = Partial<Omit<ClientFormMediaCreateFields, 'client_id'>>
