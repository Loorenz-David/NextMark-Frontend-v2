import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { VehicleFormPayload } from '../popups/VehicleForm/VehicleForm.types'

export const useVehicleActions = () => {
  const popupManager = usePopupManager()

  const openVehicleForm = useCallback((payload: VehicleFormPayload) => {
    popupManager.open({ key: 'vehicle.form', payload })
  }, [popupManager])

  return { openVehicleForm }
}
