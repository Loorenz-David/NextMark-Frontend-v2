import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useVehiclePopupController = () => {
  const popupManager = usePopupManager()

  const closeVehicleForm = useCallback(() => {
    popupManager.closeByKey('vehicle.form')
  }, [popupManager])

  return { closeVehicleForm }
}
