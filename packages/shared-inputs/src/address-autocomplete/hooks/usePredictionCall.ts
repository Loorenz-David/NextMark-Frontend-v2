import { useState, useCallback } from 'react'
import type {
  ComponentRestrictions,
  EnsureGooglePlacesServicesResult,
  PlacesServiceStatus,
} from '@shared-google-maps'
import { getPlacePredictionsQuery } from '@shared-google-maps'
import type { PlaceSuggestion } from '../types'

type PredictionsState = {
  suggestions: PlaceSuggestion[]
  status: PlacesServiceStatus | 'idle'
  error?: string
  isLoading: boolean
}




const initialPredictionState: PredictionsState = {
  suggestions: [],
  status: 'idle',
  isLoading: false,
}

type PropsUsePredictionCall = {
    componentRestrictions?: ComponentRestrictions
    ensureServices: ()=> Promise<EnsureGooglePlacesServicesResult>
}

export const usePredictionCall = ({
    componentRestrictions,
    ensureServices
}:PropsUsePredictionCall)=>{

    const [ predictions, setPredictions ] = useState<PredictionsState>(initialPredictionState)


    const resetPredictions = useCallback(() => {
        setPredictions(initialPredictionState)
      }, [])
    const fetchPredictions = useCallback(
        async (input: string) => {

          if (!input.trim()) {
            resetPredictions()
            return
          }
    
          setPredictions((prev) => ({ ...prev, isLoading: true }))
    
          try {
            const result = await getPlacePredictionsQuery(
              {
                ensureServices,
              },
              {
                input,
                componentRestrictions,
              },
            )

            const mappedSuggestions: PlaceSuggestion[] = result.suggestions.map((suggestion) => ({
              type: 'place',
              description: suggestion.description,
              placeId: suggestion.placeId,
              mainText: suggestion.mainText,
              secondaryText: suggestion.secondaryText,
            }))

            setPredictions({
              suggestions: mappedSuggestions,
              status: result.status,
              isLoading: false,
              error: result.error,
            })
          } catch (error) {
            setPredictions({
              suggestions: [],
              status: 'UNKNOWN_ERROR',
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        },
        [componentRestrictions, ensureServices, resetPredictions],
      )
      
    return {
        resetPredictions,
        fetchPredictions,
        predictions
    }
}
