import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { FacilityFormPayload } from '../popups/FacilityForm/FacilityForm.types'

export const useFacilityActions = () => {
  const popupManager = usePopupManager()

  const openFacilityForm = useCallback((payload: FacilityFormPayload) => {
    popupManager.open({ key: 'facility.form', payload })
  }, [popupManager])

  return {
    openFacilityForm,
  }
}
