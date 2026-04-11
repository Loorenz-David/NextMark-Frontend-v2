import { normalizeCostumerPayload } from '../domain/normalizeCostumerPayload'
import { setVisibleCostumerIds } from '../store/costumer.patchers'
import { useGetCostumerApi, useListCostumerOrdersApi, useListCostumersApi } from '../api/costumerApi'
import { useMessageHandler } from '@shared-message-handler'
import { upsertCostumers } from '../store/costumer.upserters'
import {  setCostumerListError, setCostumerListLoading, setCostumerListResult } from '../store/costumerList.store'
import type {
  CostumerMap,
  CostumerQueryFilters,
} from '../dto/costumer.dto'
import { ApiError } from '@/lib/api/ApiClient'
import { useCallback } from 'react'
import { upsertOrders } from '@/features/order'


export const buildCostumerQueryKey = (query?: CostumerQueryFilters) => JSON.stringify(query ?? {})


export const useCostumerQueries = ()=>{
    const listCostumersApi = useListCostumersApi()
    const listCostumerOrdersApi = useListCostumerOrdersApi()
    const getCostumerApi = useGetCostumerApi()
    const { showMessage } = useMessageHandler()

    const queryCostumers = useCallback(async (query?: CostumerQueryFilters): Promise<CostumerMap | null> => {
        const queryKey = buildCostumerQueryKey(query)
        setCostumerListLoading(true)

        try {
        const response = await listCostumersApi(query)
        const payload = response.data

        if (!payload?.costumer) {
            setCostumerListError('Missing costumers response.')
            return null
        }

        const normalized = normalizeCostumerPayload(payload.costumer)
        upsertCostumers(normalized)
        setVisibleCostumerIds(normalized.allIds)

        setCostumerListResult({
            queryKey,
            query,
            stats: payload.costumer_stats,
            pagination: payload.costumer_pagination,
        })

        return normalized
        } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load costumers.'
        const status = error instanceof ApiError ? error.status : 500

        setCostumerListError(message)
        showMessage({ status, message })

        return null
        }
    }, [] )

    const queryCostumerByEmail = useCallback(async (email: string): Promise<CostumerMap | null> => {
        const trimmedEmail = email.trim()
        if (!trimmedEmail) {
            return null
        }

        return queryCostumers({
            q: trimmedEmail,
            email: trimmedEmail,
            limit: 1,
        })
    },[])

    const getCostumer = useCallback(
        async (costumerId: number | string) => {
          try {
            const response = await getCostumerApi(costumerId)
            const payload = response.data?.costumer
    
            if (!payload) {
              showMessage({ status: 404, message: 'Costumer not found.' })
              return null
            }
    
            const normalized = normalizeCostumerPayload(payload)
            upsertCostumers(normalized)

            return Object.values(normalized.byClientId)[0]
          } catch (error) {
            const message = error instanceof ApiError ? error.message : 'Unable to load costumer.'
            const status = error instanceof ApiError ? error.status : 500
            showMessage({ status, message })
            return null
          }
        },
        [getCostumerApi, showMessage],
      )

    const queryCostumerByServerId = useCallback(
      async (costumerId: number | string) => getCostumer(costumerId),
      [getCostumer],
    )

    const queryCostumerOrdersByServerId = useCallback(
      async (
        costumerId: number,
        query?: { limit?: number; offset?: number },
      ) => {
        try {
          const response = await listCostumerOrdersApi(costumerId, query)
          const payload = response.data?.order
          if (!payload) return null
          upsertOrders(payload)
          return payload
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Unable to load costumer orders.'
          const status = error instanceof ApiError ? error.status : 500
          showMessage({ status, message })
          return null
        }
      },
      [listCostumerOrdersApi, showMessage],
    )

    return {
        queryCostumers,
        queryCostumerByEmail,
        getCostumer,
        queryCostumerByServerId,
        queryCostumerOrdersByServerId,
    }
}
