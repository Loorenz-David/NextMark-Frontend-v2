import { useMemo } from 'react'

import { buildFallbackVehicleSearchResult } from '../domain/vehicleQuery.domain'

import { useVehicles } from './useVehicleSelectors'

export const useVehicleStoreQuery = (query: string, limit = 25) => {
  const vehicles = useVehicles()

  return useMemo(
    () =>
      buildFallbackVehicleSearchResult({
        vehicles,
        input: query,
        limit,
      }).vehicles,
    [limit, query, vehicles],
  )
}
