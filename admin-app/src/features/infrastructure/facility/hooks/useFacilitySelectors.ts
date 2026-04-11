import { useShallow } from 'zustand/react/shallow'

import {
  selectAllFacilities,
  selectFacilityByClientId,
  selectFacilityByServerId,
  useFacilityStore,
} from '../store/facilityStore'

export const useFacilities = () => useFacilityStore(useShallow(selectAllFacilities))

export const useFacilityByClientId = (clientId: string | null | undefined) =>
  useFacilityStore(selectFacilityByClientId(clientId))

export const useFacilityByServerId = (id: number | null | undefined) =>
  useFacilityStore(selectFacilityByServerId(id))
