import { useEffect, useRef } from 'react'

import { useGetFacility } from '../api/facilityApi'
import { useFacilities } from './useFacilitySelectors'
import { upsertFacility } from '../store/facilityStore'

const canFetchFacilityById = (value: number | string) =>
  typeof value === 'number' || /^\d+$/.test(String(value))

export const useHydrateSelectedFacilities = (selectedFacilityIds: Array<number | string>) => {
  const getFacility = useGetFacility()
  const facilities = useFacilities()
  const requestedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const facilityKeySet = new Set(
      facilities.flatMap((facility) => [String(facility.client_id), String(facility.id ?? '')]),
    )

    const missingIds = selectedFacilityIds.filter((id) => {
      const key = String(id)
      if (!key || facilityKeySet.has(key) || requestedIdsRef.current.has(key)) {
        return false
      }

      return canFetchFacilityById(id)
    })

    if (!missingIds.length) {
      return
    }

    let cancelled = false

    missingIds.forEach((id) => {
      requestedIdsRef.current.add(String(id))
    })

    Promise.allSettled(
      missingIds.map(async (id) => {
        const response = await getFacility(id)
        return response.data?.facility ?? null
      }),
    ).then((results) => {
      if (cancelled) {
        return
      }

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          upsertFacility(result.value)
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [facilities, getFacility, selectedFacilityIds])
}
