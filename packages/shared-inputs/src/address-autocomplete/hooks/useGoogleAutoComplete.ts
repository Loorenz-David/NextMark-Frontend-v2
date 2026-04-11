import { useRef } from 'react'

import { createGooglePlacesServiceAccess } from '@shared-google-maps'
import { usePredictionCall } from './usePredictionCall'
import { usePlacesCall } from './usePlacesCall'
import { useAddressCurrentLocationFlow } from './useAddressCurrentLocationFlow'

import type { ComponentRestrictions, GooglePlacesServiceAccess } from '@shared-google-maps'

type PropsUsePlacesAutoComplete = {
  componentRestrictions?: ComponentRestrictions
}

export const useGoogleAutoComplete = ({ componentRestrictions }: PropsUsePlacesAutoComplete) => {
  const servicesRef = useRef<GooglePlacesServiceAccess | null>(null)

  if (!servicesRef.current) {
    servicesRef.current = createGooglePlacesServiceAccess()
  }

  const { fetchPredictions, resetPredictions, predictions } = usePredictionCall({
    ensureServices: servicesRef.current.ensureServices,
    componentRestrictions,
  })
  const { getPlaceDetails } = usePlacesCall({
    ensureServices: servicesRef.current.ensureServices,
    resetSessionToken: servicesRef.current.resetSessionToken,
  })
  const { getCurrentLocationAddress } = useAddressCurrentLocationFlow()

  return {
    fetchPredictions,
    resetPredictions,
    predictions,
    getPlaceDetails,
    getCurrentLocationAddress,
  }
}
