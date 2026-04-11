import type {
  ComponentRestrictions,
  EnsureGooglePlacesServicesResult,
  PlaceSuggestion,
  PlacesServiceStatus,
} from './types'

export type PlacePredictionsResult = {
  suggestions: PlaceSuggestion[]
  status: PlacesServiceStatus
  error?: string
}

type GetPlacePredictionsDependencies = {
  ensureServices: () => Promise<EnsureGooglePlacesServicesResult>
}

type GetPlacePredictionsParams = {
  input: string
  componentRestrictions?: ComponentRestrictions
}

export async function getPlacePredictionsQuery(
  dependencies: GetPlacePredictionsDependencies,
  params: GetPlacePredictionsParams,
): Promise<PlacePredictionsResult> {
  const input = params.input.trim()
  if (!input) {
    return {
      suggestions: [],
      status: 'ZERO_RESULTS',
    }
  }

  const { autocompleteService, sessionToken } = await dependencies.ensureServices()

  if (!autocompleteService) {
    return {
      suggestions: [],
      status: 'UNKNOWN_ERROR',
      error: 'Places autocomplete service is unavailable.',
    }
  }

  return new Promise((resolve) => {
    autocompleteService.getPlacePredictions(
      {
        input,
        sessionToken: sessionToken ?? undefined,
        componentRestrictions: params.componentRestrictions,
      },
      (suggestions, status) => {
        if (status !== 'OK' || !suggestions) {
          resolve({
            suggestions: [],
            status,
            error: status === 'ZERO_RESULTS' ? undefined : status,
          })
          return
        }

        resolve({
          suggestions: suggestions.map((suggestion) => ({
            description: suggestion.description,
            placeId: suggestion.place_id,
            mainText: suggestion.structured_formatting?.main_text,
            secondaryText: suggestion.structured_formatting?.secondary_text,
          })),
          status,
        })
      },
    )
  })
}
