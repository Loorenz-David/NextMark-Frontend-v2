import { useCallback } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

export const useCostumerDetailActions = ({ onClose }: { onClose?: () => void } = {}) => {
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()

  const openCostumerEditForm = useCallback(
    (clientId?: string | null) => {
      if (!clientId) return
      popupManager.open({
        key: 'costumer.form',
        payload: {
          mode: 'edit',
          clientId,
        },
      })
    },
    [popupManager],
  )

  const openOrderFormCreateForCostumer = useCallback(
    (costumerId?: number | null) => {
      if (typeof costumerId !== 'number') return
      popupManager.open({
        key: 'order.edit',
        payload: {
          mode: 'create',
          costumer_id: costumerId,
          controllBodyLayout: true,
        },
      })
    },
    [popupManager],
  )

  const openOrderDetail = useCallback(
    (payload: { clientId?: string; serverId?: number }) => {
      if (!payload.clientId && typeof payload.serverId !== 'number') return
      sectionManager.open({
        key: 'order.details',
        payload: {
          clientId: payload.clientId,
          serverId: payload.serverId,
          mode: 'view',
        },
        parentParams: {
          pageClass: 'bg-[var(--color-muted)]/10',
          borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
        },
      })
    },
    [sectionManager],
  )

  const closeCostumerDetail = useCallback(() => {
    if (onClose) {
      onClose()
      return
    }
    sectionManager.close()
  }, [onClose, sectionManager])

  return {
    openCostumerEditForm,
    openOrderFormCreateForCostumer,
    openOrderDetail,
    closeCostumerDetail,
  }
}

