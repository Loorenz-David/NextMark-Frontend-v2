import { ApiError } from "@/lib/api/ApiClient"

import { useCallback } from "react"
import type { OrderCase } from "../types"
import { removeOrderCaseByClientId, selectOrderCaseByClientId, upsertOrderCase, useOrderCaseStore } from "../store/orderCaseStore"
import { useMessageHandler } from "@shared-message-handler"
import { useCreateOrderCase, useDeleteOrderCase } from "../api/orderCase.api"
import { useOrderCaseModel } from "../domain/orderCase.model"
import { useOrderCaseValidation } from "../domain/order.validation"



export const useCaseOrderController = () => {
    const { showMessage } = useMessageHandler()
    const createOrderCaseApi = useCreateOrderCase()
    const deleteOrderCaseApi = useDeleteOrderCase()
    const { stripCaseForCreation } = useOrderCaseModel()
    const validation = useOrderCaseValidation()
    const createCase = useCallback(
        async (payload:OrderCase) => {
          
        const payloadIsValid = validation.validateCreateCasePayload(payload)
        if(!payloadIsValid){
            showMessage({ status: 400, message: 'Invalid case payload.' })
            return false
        }

        upsertOrderCase(payload)
    
        try {
            const stripedPayload = stripCaseForCreation(payload)
            
           
    
            const response = await createOrderCaseApi(stripedPayload)
    
            const responseCases = (response?.data?.order_case ?? {}) as Record<string, unknown>
            const returnedCaseCandidate = responseCases[payload.client_id]
    
            if (!returnedCaseCandidate || typeof returnedCaseCandidate !== 'object') {
              showMessage({ status: 500, message: 'Case created but returned payload was invalid.' })
              return false
            }
    
            const returnedCase = returnedCaseCandidate as Partial<OrderCase>
            if (typeof returnedCase.id !== 'number') {
              showMessage({ status: 500, message: 'Case created but id was not returned.' })
              return false
            }

            upsertOrderCase({
              ...payload,
              ...returnedCase,
            })
    
            return true

          } catch (error) {
    
            removeOrderCaseByClientId(payload.client_id)
    
            const message = error instanceof ApiError ? error.message : 'Unable to create case.'
            const status = error instanceof ApiError ? error.status : 500
            showMessage({ status, message })
            return false
          }
        },
        [createOrderCaseApi, showMessage, validation],
      )
    
     const deleteCase = useCallback(
        async (orderCaseClientId: string) => {
          const current = selectOrderCaseByClientId(orderCaseClientId)(useOrderCaseStore.getState())

          if (!current ) return false
          
          removeOrderCaseByClientId(current.client_id)
    
          try {
            const orderCaseId = current.id
            if (typeof orderCaseId !== 'number') return false
    
            await deleteOrderCaseApi({ target_id: orderCaseId })
           
            return true
          } catch (error) {
            upsertOrderCase(current)
            const message = error instanceof ApiError ? error.message : 'Unable to delete case.'
            const status = error instanceof ApiError ? error.status : 500
            showMessage({ status, message })
            return false
          }
        },
        [deleteOrderCaseApi, showMessage],
      )


    return {
        createCase,
        deleteCase
    }
}