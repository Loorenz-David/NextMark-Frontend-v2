import { useEffect, useMemo, useRef, useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { ApiError } from '@/lib/api/ApiClient'

import { useGetFacilities } from '../api/facilityApi'
import { buildFacilitySearchQuery } from '../domain/facilityQuery.domain'
import { normalizeFacilities, toFacilityArray } from '../domain/useFacilityModel'
import { insertFacilities } from '../store/facilityStore'
import type { Facility } from '../types/facility'

import { useFacilityStoreQuery } from './useFacilityStoreQuery'

const INITIAL_SELECTOR_LIMIT = 3

export const useFacilitySelectorQuery = ({
  query,
  limit = 25,
  initialLimit = INITIAL_SELECTOR_LIMIT,
}: {
  query: string
  limit?: number
  initialLimit?: number
}) => {
  const getFacilities = useGetFacilities()
  const { showMessage } = useMessageHandler()
  const localFacilities = useFacilityStoreQuery(query, limit)
  const [isLoading, setIsLoading] = useState(false)
  const requestedQueryRef = useRef<string | null>(null)
  const hasRequestedInitialRef = useRef(false)

  const trimmedQuery = query.trim()

  useEffect(() => {
    if (localFacilities.length > 0) {
      setIsLoading(false)
      if (!trimmedQuery) {
        requestedQueryRef.current = null
      }
      return
    }

    if (!trimmedQuery && hasRequestedInitialRef.current) {
      setIsLoading(false)
      return
    }

    if (trimmedQuery && requestedQueryRef.current === trimmedQuery) {
      setIsLoading(false)
      return
    }

    if (trimmedQuery) {
      requestedQueryRef.current = trimmedQuery
    } else {
      hasRequestedInitialRef.current = true
      requestedQueryRef.current = null
    }

    const controller = new AbortController()
    setIsLoading(true)
    const requestLimit = trimmedQuery ? limit : initialLimit

    getFacilities(
      buildFacilitySearchQuery({
        input: trimmedQuery,
        limit: requestLimit,
      }),
      controller.signal,
    )
      .then((response) => {
        const facilities = toFacilityArray(response.data?.facilities)
        const normalized = normalizeFacilities(facilities)
        if (normalized) {
          insertFacilities(normalized)
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        const message =
          error instanceof ApiError ? error.message : 'Unable to load facilities.'
        showMessage({ status: 500, message })
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [getFacilities, initialLimit, limit, localFacilities.length, showMessage, trimmedQuery])

  const items = useMemo<Facility[]>(() => localFacilities.slice(0, limit), [limit, localFacilities])

  return {
    items,
    isLoading,
  }
}
