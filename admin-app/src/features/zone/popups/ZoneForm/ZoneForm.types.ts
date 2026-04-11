import type { GeoJSONPolygon } from '@/features/zone/types'
import type { ZoneFormState } from '@/features/zone/domain/zoneForm.domain'

export type ZoneFormPayload =
  | { mode: 'create'; geometry: GeoJSONPolygon; versionId: number }
  | { mode: 'edit'; zoneId: number; versionId: number }

export type ZoneFormMode = ZoneFormPayload['mode']

export type { ZoneFormState }
