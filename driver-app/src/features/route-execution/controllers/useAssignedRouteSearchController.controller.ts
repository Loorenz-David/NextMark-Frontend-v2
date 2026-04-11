import { useEffect, useMemo, useRef, useState } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import type { PlaceSuggestion } from '@shared-google-maps'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { searchAssignedRouteStops } from '../domain/searchAssignedRouteStops'
import type { PersonalAddressSearchResult, RouteSearchResult } from '../domain/assignedRouteSearch.types'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

function mapSuggestionToResult(suggestion: PlaceSuggestion): PersonalAddressSearchResult {
  return {
    id: suggestion.placeId,
    kind: 'personal-address',
    placeId: suggestion.placeId,
    title: suggestion.mainText ?? suggestion.description,
    subtitle: suggestion.secondaryText ?? null,
  }
}

export function useAssignedRouteSearchController() {
  const { workspace } = useWorkspace()
  const { addressAutocompleteService } = useDriverServices()
  const { showMessage } = useMessageHandler()
  const { pushBottomSheet } = useDriverAppShell()
  const {
    closeRouteSearch,
    routeSearchQuery,
    setRouteSearchQuery,
  } = useRouteExecutionShell()
  const route = useSelectedAssignedRoute()
  const [personalResults, setPersonalResults] = useState<PersonalAddressSearchResult[]>([])
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false)
  const [personalSearchError, setPersonalSearchError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const searchMode = workspace?.currentWorkspace === 'team' ? 'team' : 'personal'

  useEffect(() => {
    if (searchMode !== 'personal') {
      requestIdRef.current += 1
      return
    }

    const query = routeSearchQuery.trim()
    if (!query) {
      requestIdRef.current += 1
      return
    }

    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId
    const timeoutId = window.setTimeout(() => {
      setIsSearchingAddresses(true)
      setPersonalSearchError(null)

      void addressAutocompleteService.getSuggestions(query)
        .then((suggestions) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          setPersonalResults(suggestions.map(mapSuggestionToResult))
        })
        .catch((error) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          console.error('Failed to search address suggestions', error)
          setPersonalResults([])
          setPersonalSearchError('Unable to load address suggestions.')
        })
        .finally(() => {
          if (requestIdRef.current === currentRequestId) {
            setIsSearchingAddresses(false)
          }
        })
    }, 180)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [addressAutocompleteService, routeSearchQuery, searchMode])

  const teamResults = useMemo(
    () => searchAssignedRouteStops(route, routeSearchQuery),
    [route, routeSearchQuery],
  )

  const results = useMemo<RouteSearchResult[]>(
    () => {
      if (!routeSearchQuery.trim()) {
        return []
      }

      return searchMode === 'team' ? teamResults : personalResults
    },
    [personalResults, routeSearchQuery, searchMode, teamResults],
  )

  const isSearching = searchMode === 'personal' && routeSearchQuery.trim() ? isSearchingAddresses : false
  const searchError = searchMode === 'personal' && routeSearchQuery.trim() ? personalSearchError : null

  const selectResult = async (result: RouteSearchResult) => {
    if (result.kind === 'team-stop') {
      closeRouteSearch()
      pushBottomSheet('route-stop-detail', { stopClientId: result.stopClientId })
      return
    }

    try {
      const resolvedAddress = await addressAutocompleteService.resolveAddress(result.placeId)
      console.info('Assigned route personal search address selected', resolvedAddress)
      showMessage({ status: 200, message: 'Address selected.' })
      closeRouteSearch()
    } catch (error) {
      console.error('Failed to resolve selected address', error)
      showMessage({ status: 500, message: 'Unable to load the selected address.' })
    }
  }

  return {
    searchMode,
    query: routeSearchQuery,
    setQuery: setRouteSearchQuery,
    results,
    isSearchingAddresses: isSearching,
    personalSearchError: searchError,
    selectResult,
  }
}
