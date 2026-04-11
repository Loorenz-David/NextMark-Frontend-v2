import { useMemo } from 'react'

import { buildFallbackFacilitySearchResult } from '../domain/facilityQuery.domain'
import { useFacilities } from './useFacilitySelectors'

export const useFacilityStoreQuery = (query: string, limit = 25) => {
  const facilities = useFacilities()

  return useMemo(
    () =>
      buildFallbackFacilitySearchResult({
        facilities,
        input: query,
        limit,
      }).facilities,
    [facilities, limit, query],
  )
}
