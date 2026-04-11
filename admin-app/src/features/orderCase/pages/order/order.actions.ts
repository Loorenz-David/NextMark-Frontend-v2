import { useCallback, useMemo } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import { useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderForCase } from '@/features/order'

import { useCaseOrderController } from '../../controllers/order.controllers'
import { useOrderCaseModel } from '../../domain/orderCase.model'
import { selectOrderCaseByClientId, useOrderCaseStore } from '../../store/orderCaseStore'

export const useCaseOrderActions = ({ onClose }: { onClose?: () => void } = {}) => {
  const sectionManager = useSectionManager()

  const { createCase, deleteCase } = useCaseOrderController()
  const { buildInitialCase } = useOrderCaseModel()
  const { changeOrderOpenCasesCount } = useOrderForCase()

  const sessionUserId = useMemo(() => {
    const userId = apiClient.getSessionUserId()
    if (typeof userId !== 'number') return null
    return userId
  }, [])

  const openCaseDetails = useCallback(
    (
      payload:
        | string
        | { orderCaseClientId?: string | null; orderCaseId?: number | null; freshAfter?: string | null },
    ) => {
      sectionManager.open({
        key: 'orderCase.details',
        payload: typeof payload === 'string' ? { orderCaseClientId: payload } : payload,
      })
    },
    [sectionManager],
  )

  const closeCaseOrder = useCallback(() => {
    if (onClose) {
      onClose()
      return
    }
    sectionManager.close()
  }, [onClose, sectionManager])

  const createOpenCase = async (orderId: number) => {
    const newCase = buildInitialCase(orderId, sessionUserId)

    changeOrderOpenCasesCount(orderId, 1)
    const success = await createCase(newCase)

    if (!success) {
      changeOrderOpenCasesCount(orderId, -1)
      return
    }

    openCaseDetails({ orderCaseClientId: newCase.client_id })
  }

  const removeCase = async (caseClientId: string) => {
    const current = selectOrderCaseByClientId(caseClientId)(useOrderCaseStore.getState())
    if (!current) return

    const isOpenCase = current.state !== 'Resolved'

    if (isOpenCase) {
      changeOrderOpenCasesCount(current.order_id, -1)
    }

    const success = await deleteCase(caseClientId)
    if (!success && isOpenCase) {
      changeOrderOpenCasesCount(current.order_id, 1)
    }
  }

  return {
    openCaseDetails,
    closeCaseOrder,
    createOpenCase,
    removeCase,
  }
}
