import { useEffect, useMemo, useRef, useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { ApiError } from '@/lib/api/ApiClient'

import { useGetVehicles } from '../api/vehicleApi'
import { buildVehicleSearchQuery } from '../domain/vehicleQuery.domain'
import { normalizeVehicles, toVehicleArray } from '../domain/useVehicleModel'
import { insertVehicles } from '../store/vehicleStore'
import type { Vehicle } from '../types/vehicle'

import { useVehicleStoreQuery } from './useVehicleStoreQuery'

const INITIAL_SELECTOR_LIMIT = 3

export const useVehicleSelectorQuery = ({
  query,
  limit = 25,
  initialLimit = INITIAL_SELECTOR_LIMIT,
}: {
  query: string
  limit?: number
  initialLimit?: number
}) => {
  const getVehicles = useGetVehicles()
  const { showMessage } = useMessageHandler()
  const localVehicles = useVehicleStoreQuery(query, limit)
  const [isLoading, setIsLoading] = useState(false)
  const requestedQueryRef = useRef<string | null>(null)
  const hasRequestedInitialRef = useRef(false)

  const trimmedQuery = query.trim()

  useEffect(() => {
    if (localVehicles.length > 0) {
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

    getVehicles(
      buildVehicleSearchQuery({
        input: trimmedQuery,
        limit: requestLimit,
      }),
      controller.signal,
    )
      .then((response) => {
        const vehicles = toVehicleArray(response.data?.vehicles)
        const normalized = normalizeVehicles(vehicles)
        if (normalized) {
          insertVehicles(normalized)
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        const message = error instanceof ApiError ? error.message : 'Unable to load vehicles.'
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
  }, [getVehicles, initialLimit, limit, localVehicles.length, showMessage, trimmedQuery])

  const items = useMemo<Vehicle[]>(() => localVehicles.slice(0, limit), [limit, localVehicles])

  return {
    items,
    isLoading,
  }
}
