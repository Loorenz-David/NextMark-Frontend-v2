import type { useDownloadTemplateByEventFlow } from '@/features/templates/printDocument/flows'
import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import { planApi } from '@/features/plan/api/plan.api'
import {
  selectRoutePlanByServerId,
  upsertRoutePlan,
  upsertRoutePlans,
  useRoutePlanStore,
} from '@/features/plan/store/routePlan.slice'
import type { DeliveryPlan, DeliveryPlanMap } from '@/features/plan/types/plan'

import { getOrder, getOrderRouteContext } from '../../api/orderApi'
import { useOrderModel } from '../../domain/useOrderModel'
import type { Order } from '../../types/order'
import { selectOrderByServerId, upsertOrders, useOrderStore } from '../../store/order.store'
import type { Item } from '../types'
import { itemsForDownloading } from '../domain/itemsForDownloading'
import type { availableEvents } from '@/features/templates/printDocument/types'

type DownloadByEvent = ReturnType<typeof useDownloadTemplateByEventFlow>['downloadByEvent']
type NormalizeOrderPayload = ReturnType<typeof useOrderModel>['normalizeOrderPayload']

const ensureRoutePlanForLabel = async (routePlanId: number | null | undefined) => {
  if (typeof routePlanId !== 'number') return

  const existingPlan = selectRoutePlanByServerId(routePlanId)(useRoutePlanStore.getState())
  if (existingPlan) return

  const response = await planApi.getPlan(routePlanId)
  const normalized = normalizeEntityMap<DeliveryPlan>(
    response.data?.route_plan as DeliveryPlanMap | DeliveryPlan,
  )
  if (!normalized) return

  if (normalized.allIds.length === 1) {
    upsertRoutePlan(normalized.byClientId[normalized.allIds[0]])
    return
  }

  upsertRoutePlans(normalized)
}

const resolveOrderForLabel = async (
  orderId: number,
  order: Order | null | undefined,
  normalizeOrderPayload: NormalizeOrderPayload,
) => {
  if (order) return order

  const storedOrder = selectOrderByServerId(orderId)(useOrderStore.getState())
  if (storedOrder) return storedOrder

  const response = await getOrder(orderId)
  if (response.data?.order) {
    upsertOrders(normalizeOrderPayload(response.data.order))
  }

  return selectOrderByServerId(orderId)(useOrderStore.getState()) ?? null
}

const resolveRoutePlanIdForLabel = async (
  orderId: number,
  deliveryPlanId: number | null | undefined,
) => {
  if (typeof deliveryPlanId === 'number') return deliveryPlanId

  const response = await getOrderRouteContext(orderId)
  const routePlanId = response.data?.route_plan_id
  return typeof routePlanId === 'number' ? routePlanId : null
}

export const startItemLabelDownload = ({
  downloadByEvent,
  event,
  items,
  normalizeOrderPayload,
  order,
  orderId,
}: {
  downloadByEvent: DownloadByEvent
  event: Extract<availableEvents, 'item_created' | 'item_edited'>
  items: Item[]
  normalizeOrderPayload: NormalizeOrderPayload
  order?: Order | null
  orderId: number
}) => {
  if (items.length === 0) return

  void (async () => {
    const resolvedOrder = await resolveOrderForLabel(orderId, order, normalizeOrderPayload)
    const routePlanId = await resolveRoutePlanIdForLabel(orderId, resolvedOrder?.delivery_plan_id)
    await ensureRoutePlanForLabel(routePlanId)

    await downloadByEvent({
      channel: 'item',
      event,
      data: itemsForDownloading(
        items,
        resolvedOrder?.order_scalar_id,
        routePlanId,
        resolvedOrder?.order_notes,
      ),
      fileName: 'first test',
    })
  })()
}
