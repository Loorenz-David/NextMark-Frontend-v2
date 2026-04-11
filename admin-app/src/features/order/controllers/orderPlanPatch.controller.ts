import { useCallback } from 'react'

import type { Order } from '../types/order'
import { useOrderStore } from '../store/order.store'

type PatchOrdersPlanParams = {
  orderServerIds: number[]
  planId: number
  planType: string
}

type OrderPlanLinkSnapshot = Record<
  string,
  {
    delivery_plan_id: number | null
    order_plan_objective: string | null
  }
>

export const useOrderPlanPatchController = () => {
  const patchOrdersPlanByServerIds = useCallback(
    ({ orderServerIds, planId, planType }: PatchOrdersPlanParams) => {
      if (!Array.isArray(orderServerIds) || orderServerIds.length === 0) {
        return {
          patchedClientIds: [],
          skippedServerIds: [],
        }
      }

      if (!Number.isFinite(planId)) {
        return {
          patchedClientIds: [],
          skippedServerIds: Array.from(new Set(orderServerIds.filter((id) => Number.isFinite(id)))),
        }
      }

      const state = useOrderStore.getState()
      const uniqueServerIds = Array.from(new Set(orderServerIds.filter((id) => Number.isFinite(id))))
      const patchedClientIds: string[] = []
      const skippedServerIds: number[] = []

      uniqueServerIds.forEach((serverId) => {
        const clientId = state.idIndex[serverId]
        if (!clientId || !state.byClientId[clientId]) {
          skippedServerIds.push(serverId)
          return
        }
        patchedClientIds.push(clientId)
      })

      if (patchedClientIds.length > 0) {
        state.patchMany(patchedClientIds, {
          delivery_plan_id: planId,
          order_plan_objective: planType,
        })
      }

      return {
        patchedClientIds,
        skippedServerIds,
      }
    },
    [],
  )

  const clearOrdersPlanByPlanId = useCallback((planId: number) => {
    if (!Number.isFinite(planId)) {
      return {
        patchedClientIds: [],
        previousByClientId: {} as OrderPlanLinkSnapshot,
      }
    }

    const state = useOrderStore.getState()
    const patchedClientIds: string[] = []
    const previousByClientId: OrderPlanLinkSnapshot = {}

    state.allIds.forEach((clientId) => {
      const order = state.byClientId[clientId]
      if (!order || order.delivery_plan_id !== planId) return

      patchedClientIds.push(clientId)
      previousByClientId[clientId] = {
        delivery_plan_id: order.delivery_plan_id ?? null,
        order_plan_objective: order.order_plan_objective ?? null,
      }
    })

    if (patchedClientIds.length > 0) {
      state.patchMany(patchedClientIds, {
        delivery_plan_id: null,
        order_plan_objective: null,
      })
    }

    return {
      patchedClientIds,
      previousByClientId,
    }
  }, [])

  const restoreOrdersPlanLinks = useCallback((snapshot: OrderPlanLinkSnapshot) => {
    const state = useOrderStore.getState()
    const entries = Object.entries(snapshot || {})
    if (!entries.length) {
      return { restoredClientIds: [] as string[] }
    }

    const restoredClientIds: string[] = []
    entries.forEach(([clientId, previous]) => {
      if (!state.byClientId[clientId]) return
      state.update(clientId, (order: Order) => ({
        ...order,
        delivery_plan_id: previous.delivery_plan_id,
        order_plan_objective: previous.order_plan_objective,
      }))
      restoredClientIds.push(clientId)
    })

    return { restoredClientIds }
  }, [])

  return {
    patchOrdersPlanByServerIds,
    clearOrdersPlanByPlanId,
    restoreOrdersPlanLinks,
  }
}
