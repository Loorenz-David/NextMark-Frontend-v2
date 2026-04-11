import { useCallback } from 'react'
import type { address } from '@shared-domain/core/address'

import type { EnsureGooglePlacesServicesResult } from '@shared-google-maps'
import { getPlaceDetailsQuery } from '@shared-google-maps'

type PropsUsePlacesCall = {
  ensureServices: () => Promise<EnsureGooglePlacesServicesResult>
  resetSessionToken?: () => void
}

export const usePlacesCall = ({ ensureServices, resetSessionToken }: PropsUsePlacesCall) => {
  const getPlaceDetails = useCallback(
    async (placeId: string) => {
      const payload = await getPlaceDetailsQuery(
        {
          ensureServices,
          resetSessionToken,
        },
        placeId,
      )

      return {
        street_address: payload.raw_address,
        country: payload.country,
        city: payload.city,
        postal_code: payload.postal_code,
        coordinates: payload.coordinates,
      } satisfies address
    },
    [ensureServices, resetSessionToken],
  )

  return {
    getPlaceDetails,
  }
}
