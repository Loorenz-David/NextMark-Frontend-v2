import type {
  AiActionDescriptor,
  AiLegacyDataToBlocksMapper,
  AiMessageBlock,
} from '@nextmark/ai-panel'

type RecordData = Record<string, unknown>

function isRecord(value: unknown): value is RecordData {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toActions(value: unknown): AiActionDescriptor[] | undefined {
  if (!Array.isArray(value)) return undefined

  const actions = value
    .filter(isRecord)
    .map((entry) => ({
      id: typeof entry.id === 'string' ? entry.id : undefined,
      type: typeof entry.type === 'string' ? entry.type : 'copy_text',
      label: typeof entry.label === 'string' ? entry.label : 'Run action',
      payload: isRecord(entry.payload) ? entry.payload : undefined,
      hint: typeof entry.hint === 'string' ? entry.hint : undefined,
      disabled: typeof entry.disabled === 'boolean' ? entry.disabled : undefined,
    }))

  return actions.length ? actions : undefined
}

function normalizeBlock(block: RecordData): AiMessageBlock | null {
  const kind = typeof block.kind === 'string' ? block.kind : null
  const data = block.data
  if (!kind || data === undefined) return null

  const normalized: AiMessageBlock = {
    id: typeof block.id === 'string' ? block.id : undefined,
    kind: kind as AiMessageBlock['kind'],
    entityType: typeof block.entity_type === 'string'
      ? (block.entity_type as AiMessageBlock['entityType'])
      : typeof block.entityType === 'string'
        ? (block.entityType as AiMessageBlock['entityType'])
        : undefined,
    layout: typeof block.layout === 'string' ? (block.layout as AiMessageBlock['layout']) : undefined,
    title: typeof block.title === 'string' ? block.title : undefined,
    subtitle: typeof block.subtitle === 'string' ? block.subtitle : undefined,
    data,
    actions: toActions(block.actions),
    meta: isRecord(block.meta) ? block.meta : undefined,
  }

  return normalized
}

function collectionBlock(entityType: AiMessageBlock['entityType'], title: string, items: unknown): AiMessageBlock | null {
  if (!Array.isArray(items) || items.length === 0) return null

  return {
    kind: 'entity_collection',
    entityType,
    layout: entityType === 'order' ? 'table' : 'cards',
    title,
    data: { items, total: items.length },
  }
}

function detailBlock(entityType: AiMessageBlock['entityType'], title: string, value: unknown): AiMessageBlock | null {
  if (!isRecord(value)) return null

  const data = value
  const quickActions: AiActionDescriptor[] = []

  if (typeof data.phone === 'string') {
    quickActions.push({
      type: 'copy_text',
      label: 'Copy phone',
      payload: { text: data.phone },
      variant: 'ghost',
    })
  }

  if (typeof data.email === 'string') {
    quickActions.push({
      type: 'copy_text',
      label: 'Copy email',
      payload: { text: data.email },
      variant: 'ghost',
    })
  }

  return {
    kind: 'entity_detail',
    entityType,
    layout: 'card',
    title,
    data,
    actions: quickActions.length ? quickActions : undefined,
  }
}

export const mapLegacyAiDataToBlocks: AiLegacyDataToBlocksMapper = (data) => {
  if (!isRecord(data)) return null

  if (Array.isArray(data.blocks)) {
    const mapped = data.blocks
      .filter(isRecord)
      .map(normalizeBlock)
      .filter((item): item is AiMessageBlock => item !== null)

    if (mapped.length) return mapped
  }

  const blocks: AiMessageBlock[] = []

  const driverDetail = detailBlock('driver', 'Driver', data.driver)
  if (driverDetail) blocks.push(driverDetail)

  const clientDetail = detailBlock('client', 'Client', data.client)
  if (clientDetail) blocks.push(clientDetail)

  const routeDetail = detailBlock('route', 'Route', data.route)
  if (routeDetail) blocks.push(routeDetail)

  const planDetail = detailBlock('plan', 'Plan', data.plan)
  if (planDetail) blocks.push(planDetail)

  const orderDetail = detailBlock('order', 'Order', data.order)
  if (orderDetail) blocks.push(orderDetail)

  const ordersCollection = collectionBlock('order', 'Orders', data.orders)
  if (ordersCollection) blocks.push(ordersCollection)

  const routesCollection = collectionBlock('route', 'Routes', data.routes)
  if (routesCollection) blocks.push(routesCollection)

  const plansCollection = collectionBlock('plan', 'Plans', data.plans)
  if (plansCollection) blocks.push(plansCollection)

  const clientsCollection = collectionBlock('client', 'Clients', data.clients)
  if (clientsCollection) blocks.push(clientsCollection)

  const driversCollection = collectionBlock('driver', 'Drivers', data.drivers)
  if (driversCollection) blocks.push(driversCollection)

  if (!blocks.length && typeof data.count === 'number') {
    blocks.push({
      kind: 'stat',
      entityType: 'generic',
      layout: 'key_value',
      title: 'Summary',
      data: { count: data.count },
    })
  }

  return blocks.length ? blocks : null
}
