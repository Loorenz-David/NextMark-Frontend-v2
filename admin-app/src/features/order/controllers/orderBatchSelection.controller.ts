import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useResolveOrderBatchSelection } from '../api/orderApi'
import type { OrderBatchSelectionPayload, OrderBatchSelectionResolveResponse } from '../types/orderBatchSelection'

export const useOrderBatchSelectionController = () => {
  const resolveOrderBatchSelectionApi = useResolveOrderBatchSelection()
  const { showMessage } = useMessageHandler()

  const resolveSelection = useCallback(
    async (
      selection: OrderBatchSelectionPayload,
    ): Promise<OrderBatchSelectionResolveResponse | null> => {
      try {
        const response = await resolveOrderBatchSelectionApi(selection)
        return response.data ?? null
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to resolve order selection.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      }
    },
    [resolveOrderBatchSelectionApi, showMessage],
  )

  return {
    resolveSelection,
  }
}
