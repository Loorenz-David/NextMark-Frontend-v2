import type { Order } from '../../types/order'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

type PatchOrdersPlanResult = {
  patchedClientIds: string[]
  skippedServerIds: number[]
}

type PatchOrdersPlanArgs = {
  orderServerIds: number[]
  planId: number
  planType: string
}

type OrderStateLike = {
  byClientId: Record<string, Order>
  idIndex: Record<number, string>
  patchMany: (clientIds: string[], partial: Partial<Order>) => void
}

const patchOrdersPlan = (
  state: OrderStateLike,
  { orderServerIds, planId, planType }: PatchOrdersPlanArgs,
): PatchOrdersPlanResult => {
  if (!Array.isArray(orderServerIds) || orderServerIds.length === 0) {
    return { patchedClientIds: [], skippedServerIds: [] }
  }

  if (!Number.isFinite(planId)) {
    return {
      patchedClientIds: [],
      skippedServerIds: Array.from(new Set(orderServerIds.filter((id) => Number.isFinite(id)))),
    }
  }

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

  return { patchedClientIds, skippedServerIds }
}

export const runOrderPlanPatchControllerTests = () => {
  {
    let patched: { clientIds: string[]; partial: Partial<Order> } | null = null
    const state: OrderStateLike = {
      byClientId: {
        orderA: { client_id: 'orderA', id: 1 },
        orderB: { client_id: 'orderB', id: 2 },
      },
      idIndex: {
        1: 'orderA',
        2: 'orderB',
      },
      patchMany: (clientIds, partial) => {
        patched = { clientIds, partial }
      },
    }

    const result = patchOrdersPlan(state, {
      orderServerIds: [1, 1, 999, 2],
      planId: 100,
      planType: 'local_delivery',
    })

    assert(result.patchedClientIds.length === 2, 'should patch loaded mapped orders')
    assert(result.skippedServerIds.length === 1, 'should skip unknown server ids')
    assert(result.skippedServerIds[0] === 999, 'should skip unmatched id')
    assert(!!patched, 'should call patchMany once')
    assert(patched!.clientIds.length === 2, 'should deduplicate mapped ids')
    assert(patched!.partial.delivery_plan_id === 100, 'should patch route plan id')
    assert(patched!.partial.order_plan_objective === 'local_delivery', 'should patch plan objective')
  }

  {
    let patchCallCount = 0
    const state: OrderStateLike = {
      byClientId: {},
      idIndex: {},
      patchMany: () => {
        patchCallCount += 1
      },
    }

    const result = patchOrdersPlan(state, {
      orderServerIds: [],
      planId: 100,
      planType: 'store_pickup',
    })

    assert(result.patchedClientIds.length === 0, 'should no-op for empty ids')
    assert(result.skippedServerIds.length === 0, 'should no-op for empty ids')
    assert(patchCallCount === 0, 'should not patch for empty ids')
  }
}
