import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import {
  useCreateCostumerApi,
  useDeleteCostumerApi,
  useUpdateCostumerApi,
} from '../api/costumerApi'
import type {
  CostumerCreatePayload,
  CostumerDeletePayload,
  CostumerUpdateTargetPayload,
} from '../dto/costumer.dto'


import { useCostumerStore } from '../store/costumer.store'
import {
  removeCostumerByClientId,
  upsertCostumer,
  upsertCostumers,
} from '../store/costumer.upserters'


export const useCostumerController = () => {
  
  const createCostumerApi = useCreateCostumerApi()
  const updateCostumerApi = useUpdateCostumerApi()
  const deleteCostumerApi = useDeleteCostumerApi()
  const { showMessage } = useMessageHandler()


  const createCostumer = useCallback(
    async (payload: CostumerCreatePayload) => {
      try {
        const response = await createCostumerApi(payload)
        const created = response.data?.created ?? []

        if (!created.length) {
          showMessage({ status: 500, message: 'Create costumer response is missing created items.' })
          return null
        }

        created.forEach((bundle) => {
          if (bundle?.costumer?.client_id) {
            upsertCostumer(bundle.costumer)
          }
        })

        return created
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to create costumer.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      }
    },
    [createCostumerApi, showMessage],
  )

  const updateCostumer = useCallback(
    async (payload: CostumerUpdateTargetPayload | CostumerUpdateTargetPayload[]) => {
      try {
        const response = await updateCostumerApi(payload)
        const updated = response.data?.updated ?? []
        updated.forEach((bundle) => {
          if (bundle?.costumer?.client_id) {
            upsertCostumer(bundle.costumer)
          }
        })

        return updated
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to update costumer.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      }
    },
    [showMessage, updateCostumerApi],
  )

  const deleteCostumer = useCallback(
    async (payload: CostumerDeletePayload) => {
      try {
        const response = await deleteCostumerApi(payload)
        const deletedIds = response.data?.deleted?.costumer_ids ?? []

        const state = useCostumerStore.getState()
        deletedIds.forEach((id) => {
          const clientId = state.idIndex[id]
          if (clientId) {
            removeCostumerByClientId(clientId)
          }
        })

        return deletedIds
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to delete costumer.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      }
    },
    [deleteCostumerApi, showMessage],
  )



  return {
    createCostumer,
    updateCostumer,
    deleteCostumer,
  }
}
