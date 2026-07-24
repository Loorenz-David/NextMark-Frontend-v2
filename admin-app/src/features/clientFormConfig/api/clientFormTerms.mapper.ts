import { termsDocumentFromUnknown } from '../domain/termsDocument'
import type {
  ClientFormTermsVersion,
  ClientFormTermsVersionDto,
  ClientFormTermsVersionDtoMap,
  ClientFormTermsVersionMap,
} from '../types/clientFormTerms'

/** Mirrors the stringified server id into `client_id` so the entity store can key on it. */
export const mapTermsVersionDtoToVersion = (
  dto: ClientFormTermsVersionDto,
): ClientFormTermsVersion => ({
  id: dto.id,
  client_id: String(dto.id),
  version_number: dto.version_number,
  content: termsDocumentFromUnknown(dto.content),
  is_active: dto.is_active,
  created_at: dto.created_at,
  created_by_user_id: dto.created_by_user_id,
})

export const mapTermsVersionMap = (
  map: ClientFormTermsVersionDtoMap,
): ClientFormTermsVersionMap => {
  const byClientId: Record<string, ClientFormTermsVersion> = {}
  const allIds: string[] = []

  // `allIds` carries the server ordering (newest first) — never derive it from the map keys.
  for (const key of map.allIds) {
    const dto = map.byClientId[key]
    if (!dto) {
      continue
    }
    const version = mapTermsVersionDtoToVersion(dto)
    byClientId[version.client_id] = version
    allIds.push(version.client_id)
  }

  return { byClientId, allIds }
}
