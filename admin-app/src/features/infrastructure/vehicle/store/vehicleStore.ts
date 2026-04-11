import type { EntityTable } from "@shared-store"
import type { Vehicle } from '@/features/infrastructure/vehicle/types/vehicle'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useVehicleStore = createEntityStore<Vehicle>()

export const selectAllVehicles = (state: EntityTable<Vehicle>) => selectAll<Vehicle>()(state)

export const selectVehicleByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Vehicle>) =>
    selectByClientId<Vehicle>(clientId)(state)

export const selectVehicleByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Vehicle>) =>
    selectByServerId<Vehicle>(id)(state)

export const insertVehicle = (vehicle: Vehicle) =>
  useVehicleStore.getState().insert(vehicle)

export const insertVehicles = (table: { byClientId: Record<string, Vehicle>; allIds: string[] }) =>
  useVehicleStore.getState().insertMany(table)

export const upsertVehicle = (vehicle: Vehicle) => {
  const state = useVehicleStore.getState()
  if (state.byClientId[vehicle.client_id]) {
    state.update(vehicle.client_id, (existing) => ({ ...existing, ...vehicle }))
    return
  }
  state.insert(vehicle)
}

export const upsertVehicles = (table: { byClientId: Record<string, Vehicle>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const vehicle = table.byClientId[clientId]
    if (vehicle) {
      upsertVehicle(vehicle)
    }
  })
}

export const updateVehicle = (clientId: string, updater: (vehicle: Vehicle) => Vehicle) =>
  useVehicleStore.getState().update(clientId, updater)

export const removeVehicle = (clientId: string) =>
  useVehicleStore.getState().remove(clientId)

export const clearVehicles = () =>
  useVehicleStore.getState().clear()
