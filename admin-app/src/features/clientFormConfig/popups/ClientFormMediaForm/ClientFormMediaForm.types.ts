import type { MediaPlacement } from '../../domain/mediaPlacement'

export type ClientFormMediaFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
  /** Preselects the slot when creating from a placement group's "Add image". */
  placement?: MediaPlacement
}

export type ClientFormMediaFormState = {
  placement: MediaPlacement
  url: string
  alt_text: string
  link_url: string
  title: string
  description: string
  enabled: boolean
}
