import type { TermsDocument } from '../domain/termsDocument'

export type ClientFormTermsVersionDto = {
  id: number
  version_number: number
  content: unknown
  is_active: boolean
  created_at: string
  created_by_user_id: number | null
}

/**
 * Terms versions have no `client_id` column. The backend already keys the
 * collection by the stringified `id`, so the mapper mirrors that into
 * `client_id` — which lets the normalized entity store be used unchanged.
 */
export type ClientFormTermsVersion = {
  id: number
  client_id: string
  version_number: number
  content: TermsDocument
  is_active: boolean
  created_at: string
  created_by_user_id: number | null
}

export type ClientFormTermsVersionDtoMap = {
  byClientId: Record<string, ClientFormTermsVersionDto>
  allIds: string[]
}

export type ClientFormTermsVersionMap = {
  byClientId: Record<string, ClientFormTermsVersion>
  allIds: string[]
}
