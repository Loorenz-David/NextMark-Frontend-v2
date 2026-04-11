import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useFacilityPopupController = () => {
  const popupManager = usePopupManager()

  const closeFacilityForm = useCallback(() => {
    popupManager.closeByKey('facility.form')
  }, [popupManager])

  return { closeFacilityForm }
}
