import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import type { Vehicle, VehicleMap } from '../types/vehicle'

const normalizeVehicleArray = (items: Vehicle[]): VehicleMap => ({
  byClientId: items.reduce<Record<string, Vehicle>>((accumulator, vehicle) => {
    accumulator[vehicle.client_id] = vehicle
    return accumulator
  }, {}),
  allIds: items.map((vehicle) => vehicle.client_id),
})

const isVehicle = (value: unknown): value is Vehicle =>
  typeof value === 'object' && value !== null && 'client_id' in value

export const toVehicleArray = (
  payload: VehicleMap | Vehicle[] | Vehicle | null | undefined,
): Vehicle[] => {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload
  }

  if ('client_id' in payload) {
    return [payload]
  }

  if ('byClientId' in payload && 'allIds' in payload) {
    return payload.allIds
      .map((clientId) => payload.byClientId[clientId])
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle))
  }

  return Object.values(payload).filter(isVehicle)
}

export const normalizeVehicles = (
  payload: VehicleMap | Vehicle[] | Vehicle | null | undefined,
) => {
  if (Array.isArray(payload)) {
    return normalizeVehicleArray(payload)
  }

  return normalizeEntityMap<Vehicle>(payload ?? null)
}
