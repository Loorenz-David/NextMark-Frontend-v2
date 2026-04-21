import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  createAdminBusinessChannel,
  type BusinessEventEnvelope,
  type ClientFormSubmittedPayload,
} from '@shared-realtime'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { adminRealtimeClient } from '../client'
import {
  subscribeToClientFormSubmitted,
  unsubscribeFromClientFormSubmitted,
} from '../clientForm/clientForm.realtime'
import { getOrder } from '@/features/order/api/orderApi'
import { useOrderModel } from '@/features/order/domain/useOrderModel'
import { useOrderRouteContextFlow } from '@/features/order/flows/orderRouteContext.flow'
import {
  selectOrderByServerId,
  updateOrderByClientId,
  upsertOrders,
  useOrderStore,
} from '@/features/order/store/order.store'
import { getOrderCases } from '@/features/orderCase/api/orderCase.api'
import { useOrderCaseFlow } from '@/features/orderCase/flows/orderCase.flow'
import { useOrderCaseModel } from '@/features/orderCase/domain/orderCase.model'
import {
  selectOrderCaseById,
  selectOrderCaseByClientId,
  updateCaseState,
  upsertOrderCase,
  upsertOrderCases,
  useOrderCaseStore,
} from '@/features/orderCase/store/orderCaseStore'
import { useOrderCaseListStore } from '@/features/orderCase/store/orderCaseList.store'
import { useOrderCaseQueryStore } from '@/features/orderCase/store/orderCaseQueryStore'
import { planApi } from '@/features/plan/api/plan.api'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import { addVisibleRoutePlan, upsertRoutePlan, patchRoutePlanTotals } from '@/features/plan/store/routePlan.slice'
import { normalizeEntityMap, type EntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import {
  markAdminBusinessEventHandled,
  runDedupedGlobalOrderCasesRefresh,
  runDedupedOrderCaseRefresh,
  runDedupedOrderRefresh,
  runDedupedOrderRouteContextRefresh,
  runDedupedPlanRefresh,
} from './adminBusinessRealtimeCoordinator'

type BusinessPayload = Record<string, unknown>

const resolveTeamId = () => {
  const session = sessionStorage.getSession()
  const rawTeamId = session?.identity?.active_team_id ?? session?.user?.teamId ?? null
  const numericTeamId = Number(rawTeamId)
  return Number.isFinite(numericTeamId) ? numericTeamId : null
}

const getPayloadNumber = (payload: BusinessPayload, key: string): number | null => {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function AdminBusinessRealtimeProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  )

  const adminBusinessChannel = useMemo(
    () => createAdminBusinessChannel(adminRealtimeClient),
    [],
  )
  const { normalizeOrderPayload } = useOrderModel()
  const { fetchOrderRouteContext } = useOrderRouteContextFlow()
  const { normalizeOrderCaseEntity, normalizeOrderCaseMap } = useOrderCaseModel()
  const { loadAllCases } = useOrderCaseFlow()

  useEffect(() => {
    const socketToken = session?.socketToken ?? null
    const teamId = resolveTeamId()

    if (!socketToken || teamId == null) {
      return
    }

    const refreshOrderById = async (orderId: number) => {
      const response = await getOrder(orderId)
      const payload = response.data?.order
      if (!payload) {
        return null
      }

      const normalized = normalizeOrderPayload(payload)
      upsertOrders(normalized)
      return normalized
    }

    const refreshOrderCasesByOrderId = async (orderId: number) => {
      const response = await getOrderCases({ order_id: orderId })
      const normalized = normalizeOrderCaseMap(response.data?.order_cases)
      upsertOrderCases(normalized)
    }

    const refreshGlobalOrderCases = async () => {
      const orderCaseQueryState = useOrderCaseQueryStore.getState()
      const currentQuery = {
        q: orderCaseQueryState.search,
        filters: orderCaseQueryState.filters,
      }
      await loadAllCases(currentQuery, true)
    }

    const refreshPlanById = async (planId: number) => {
      const response = await planApi.getPlan(planId)
      const payload = response.data
      if (!payload?.route_plan) {
        return
      }

      const normalized = normalizeEntityMap<DeliveryPlan>(payload.route_plan as EntityMap<DeliveryPlan> | DeliveryPlan)
      if (!normalized) {
        return
      }

      normalized.allIds.forEach((clientId) => {
        upsertRoutePlan(normalized.byClientId[clientId] as DeliveryPlan)
        addVisibleRoutePlan(clientId)
      })
    }

    const handleOrderEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (
        event.event_name !== 'order.created'
        && event.event_name !== 'order.updated'
        && event.event_name !== 'order.state_changed'
      ) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id') ?? event.entity_id
      if (!orderId) {
        return
      }

      const order = selectOrderByServerId(orderId)(useOrderStore.getState())

      if (event.event_name === 'order.state_changed' && order) {
        const nextOrderStateId = getPayloadNumber(payload, 'order_state_id')
        if (nextOrderStateId != null) {
          updateOrderByClientId(order.client_id, (existing) => ({
            ...existing,
            order_state_id: nextOrderStateId,
          }))
        }
      }

      const routeFreshnessUpdatedAt =
        typeof payload.route_freshness_updated_at === 'string'
          ? payload.route_freshness_updated_at
          : null

      void runDedupedOrderRefresh(orderId, async () => {
        const normalizedOrderMap = await refreshOrderById(orderId)
        if (!routeFreshnessUpdatedAt || !normalizedOrderMap) {
          return
        }

        await runDedupedOrderRouteContextRefresh(
          orderId,
          () => fetchOrderRouteContext(orderId).then(() => undefined),
        )
      })
    }

    const handleOrderChatEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (event.event_name !== 'order_chat.message_created') {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')
      if (!orderId) {
        return
      }

      void runDedupedOrderRefresh(orderId, () => refreshOrderById(orderId))
      void runDedupedOrderCaseRefresh(orderId, () => refreshOrderCasesByOrderId(orderId))

      if (useOrderCaseListStore.getState().queryKey) {
        void runDedupedGlobalOrderCasesRefresh(refreshGlobalOrderCases)
      }
    }

    const handleOrderCaseEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (
        event.event_name !== 'order_case.created'
        && event.event_name !== 'order_case.updated'
        && event.event_name !== 'order_case.state_changed'
      ) {
        return
      }

      const payload = event.payload ?? {}
      const orderId = getPayloadNumber(payload, 'order_id')
      if (!orderId) {
        return
      }

      const order = selectOrderByServerId(orderId)(useOrderStore.getState())
      if (!order) {
        return
      }

      const orderCaseId = getPayloadNumber(payload, 'order_case_id')
      if (event.event_name === 'order_case.state_changed' && orderCaseId) {
        const existingOrderCase = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
        const nextState = payload.state
        if (existingOrderCase && typeof nextState === 'string') {
          updateCaseState(orderCaseId, nextState as typeof existingOrderCase.state)
        }
      }

      if (event.event_name === 'order_case.created' && orderCaseId) {
        const clientId = String(payload.order_case_client_id ?? `order-case-${orderCaseId}`)
        const existingOrderCase = selectOrderCaseById(orderCaseId)(useOrderCaseStore.getState())
          ?? selectOrderCaseByClientId(clientId)(useOrderCaseStore.getState())
        if (!existingOrderCase) {
          const normalizedEntity = normalizeOrderCaseEntity({
            id: orderCaseId,
            client_id: clientId,
            order_id: orderId,
            state: typeof payload.state === 'string' ? payload.state : 'Open',
            creation_date: String(event.occurred_at),
            unseen_chats: 0,
            chats: [],
          } as never)

          if (normalizedEntity) {
            upsertOrderCase(normalizedEntity)
          }
        }
      }

      void runDedupedOrderRefresh(orderId, () => refreshOrderById(orderId))
      void runDedupedOrderCaseRefresh(orderId, () => refreshOrderCasesByOrderId(orderId))

      if (useOrderCaseListStore.getState().queryKey) {
        void runDedupedGlobalOrderCasesRefresh(refreshGlobalOrderCases)
      }
    }

    const handlePlanEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (event.event_name !== 'delivery_plan.updated') {
        return
      }
      const payload = event.payload ?? {}
      const planId = getPayloadNumber(payload, 'delivery_plan_id') ?? event.entity_id
      if (!planId) return

      patchRoutePlanTotals(planId, {
        total_weight: payload.total_weight as number | null,
        total_volume: payload.total_volume as number | null,
        total_items: payload.total_items as number | null,
        total_orders: payload.total_orders as number | null,
      })
    }

    const handleRouteSolutionEvent = (event: BusinessEventEnvelope<BusinessPayload>) => {
      if (event.event_name !== 'route_solution.created') {
        return
      }

      const payload = event.payload ?? {}
      const deliveryPlanId = getPayloadNumber(payload, 'delivery_plan_id')
      if (!deliveryPlanId) {
        return
      }

      void runDedupedPlanRefresh(deliveryPlanId, () => refreshPlanById(deliveryPlanId))
    }

    const handleClientFormSubmitted = (payload: ClientFormSubmittedPayload) => {
      const order = selectOrderByServerId(payload.order_id)(useOrderStore.getState())
      if (!order) {
        return
      }
      // Optimistic update so the status badge reflects immediately;
      // the subsequent deduped refresh will overwrite with the exact server timestamp.
      updateOrderByClientId(order.client_id, (existing) => ({
        ...existing,
        client_form_submitted_at: new Date().toISOString(),
      }))
      void runDedupedOrderRefresh(payload.order_id, () => refreshOrderById(payload.order_id))
    }

    const releaseAdminBusiness = adminBusinessChannel.subscribeTeamAdmin((event) => {
      if (!markAdminBusinessEventHandled(event.event_id)) {
        return
      }

      handleOrderEvent(event)
      handleOrderCaseEvent(event)
      handleOrderChatEvent(event)
      handleRouteSolutionEvent(event)
      handlePlanEvent(event)
    })

    subscribeToClientFormSubmitted(handleClientFormSubmitted)

    return () => {
      releaseAdminBusiness()
      unsubscribeFromClientFormSubmitted(handleClientFormSubmitted)
    }
  }, [
    adminBusinessChannel,
    fetchOrderRouteContext,
    loadAllCases,
    normalizeOrderCaseEntity,
    normalizeOrderCaseMap,
    normalizeOrderPayload,
    session,
  ])

  return <>{children}</>
}
