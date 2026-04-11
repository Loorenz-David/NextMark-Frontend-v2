import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useUserActions = () => {
  const popupManager = usePopupManager()

  const openEditProfile = useCallback(() => {
    popupManager.open({ key: 'user.edit', parentParams: { autoHeight: true } })
  }, [popupManager])

  return { openEditProfile }
}
