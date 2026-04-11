import { useShallow } from 'zustand/react/shallow'

import {
  selectAllVehicles,
  selectVehicleByClientId,
  selectVehicleByServerId,
  useVehicleStore,
} from '../store/vehicleStore'

export const useVehicles = () => useVehicleStore(useShallow(selectAllVehicles))

export const useVehicleByClientId = (clientId: string | null | undefined) =>
  useVehicleStore(selectVehicleByClientId(clientId))

export const useVehicleByServerId = (id: number | null | undefined) =>
  useVehicleStore(selectVehicleByServerId(id))
