import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { reactiveOrderVisibility } from '../domain/orderReactiveVisibility'
import type { Order, OrderMap } from '../types/order'
import { useRoutePlanStore } from '@/features/plan/store/routePlan.slice'
import { useOrderQuery } from './orderQuery.store'
import { useOrderStateStore } from './orderState.store'
import {
  selectAllOrders,
  selectOrderByClientId,
  selectOrdersByCostumerId,
  selectOrderByServerId,
  selectOrdersByPlanId,
  setOrder,
  setOrders,
  updateOrderByClientId,
  upsertOrders,
  useOrderStore,
} from './order.store'

export const useOrders = () => useOrderStore(useShallow(selectAllOrders))

export const useVisibleOrders = () => {
  const visibleIds = useOrderStore((state) => state.visibleIds)
  const byClientId = useOrderStore((state) => state.byClientId)
  const orderStateByClientId = useOrderStateStore((state) => state.byClientId)
  const orderStateIdIndex = useOrderStateStore((state) => state.idIndex)
  const routePlanByClientId = useRoutePlanStore((state) => state.byClientId)
  const routePlanIdIndex = useRoutePlanStore((state) => state.idIndex)
  const query = useOrderQuery()

  const orderStateNameById = useMemo(() => {
    return Object.entries(orderStateIdIndex).reduce<Record<number, string>>((acc, [id, clientId]) => {
      const numericId = Number(id)
      const state = orderStateByClientId[clientId]
      if (Number.isFinite(numericId) && state?.name) {
        acc[numericId] = state.name
      }
      return acc
    }, {})
  }, [orderStateByClientId, orderStateIdIndex])

  const routePlanDateRangeById = useMemo(() => {
    return Object.entries(routePlanIdIndex).reduce<Record<number, { startDate: string | null; endDate: string | null }>>((acc, [id, clientId]) => {
      const numericId = Number(id)
      const routePlan = routePlanByClientId[clientId]
      if (Number.isFinite(numericId) && routePlan) {
        acc[numericId] = {
          startDate: routePlan.start_date ?? null,
          endDate: routePlan.end_date ?? null,
        }
      }
      return acc
    }, {})
  }, [routePlanByClientId, routePlanIdIndex])

  return useMemo(() => {
    if (!visibleIds) return []

    return visibleIds
      .map((id) => byClientId[id])
      .filter(
        (order): order is Order => !!order && reactiveOrderVisibility(order, query.filters, {
          orderStateNameById,
          routePlanDateRangeById,
        }),
      )
  }, [visibleIds, byClientId, orderStateNameById, query, routePlanDateRangeById])
}

export const useOrderByClientId = (clientId: string | null | undefined) =>
  useOrderStore(selectOrderByClientId(clientId))

export const useOrderByServerId = (id: number | null | undefined) =>
  useOrderStore(selectOrderByServerId(id))

export const useOrdersByPlanId = (planId: number | null | undefined) =>
  useOrderStore(useShallow(selectOrdersByPlanId(planId)))

export const useOrdersByCostumerServerId = (costumerId: number | null | undefined) =>
  useOrderStore(useShallow(selectOrdersByCostumerId(costumerId)))

export const useSetOrderStore = () =>
  useCallback((order: Order) => {
    setOrder(order)
  }, [])

export const useSetOrdersStore = () =>
  useCallback((table: OrderMap) => {
    setOrders(table)
  }, [])

export const useUpdateOrderStore = () =>
  useCallback(
    (clientId: string, updater: (order: Order) => Order) => {
      updateOrderByClientId(clientId, updater)
    },
    [],
  )

export const useUpsertOrdersStore = () =>
  useCallback((order: OrderMap) => {
    upsertOrders(order)
  }, [])
