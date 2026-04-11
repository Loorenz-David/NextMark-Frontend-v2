import { useEffect, useRef } from 'react'

import { useGetVehicle } from '../api/vehicleApi'
import { upsertVehicle } from '../store/vehicleStore'

import { useVehicles } from './useVehicleSelectors'

const canFetchVehicleById = (value: number | string) =>
  typeof value === 'number' || /^\d+$/.test(String(value))

export const useHydrateSelectedVehicles = (selectedVehicleIds: Array<number | string>) => {
  const getVehicle = useGetVehicle()
  const vehicles = useVehicles()
  const requestedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const vehicleKeySet = new Set(
      vehicles.flatMap((vehicle) => [String(vehicle.client_id), String(vehicle.id ?? '')]),
    )

    const missingIds = selectedVehicleIds.filter((id) => {
      const key = String(id)
      if (!key || vehicleKeySet.has(key) || requestedIdsRef.current.has(key)) {
        return false
      }

      return canFetchVehicleById(id)
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
        const response = await getVehicle(id)
        return response.data?.vehicle ?? null
      }),
    ).then((results) => {
      if (cancelled) {
        return
      }

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          upsertVehicle(result.value)
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [getVehicle, selectedVehicleIds, vehicles])
}
