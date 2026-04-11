import type { Order } from '@/features/order/types/order'

import {
  buildLocalDeliverySelectionFromClientIds,
  expandLocalDeliveryClientIdsFromMarkerSelection,
} from '../localDeliveryCircleSelection.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runLocalDeliveryCircleSelectionFlowTests = () => {
  const byClientId: Record<string, Order> = {
    syncedA: { client_id: 'syncedA', id: 201 },
    syncedB: { client_id: 'syncedB', id: 202 },
    unsynced: { client_id: 'unsynced' },
  }

  const selection = buildLocalDeliverySelectionFromClientIds(
    ['route-start-abc', 'syncedA', 'syncedA', 'unsynced', 'missing', 'route-end-abc', 'syncedB'],
    byClientId,
  )

  assert(selection.clientIds.length === 4, 'should exclude start/end boundary markers and deduplicate ids')
  assert(selection.serverIds.length === 2, 'should include only synced server ids')
  assert(selection.serverIds[0] === 201, 'should map first synced local delivery order id')
  assert(selection.serverIds[1] === 202, 'should map second synced local delivery order id')
  assert(selection.unsyncedCount === 1, 'should count only selected orders missing server ids')

  const expanded = expandLocalDeliveryClientIdsFromMarkerSelection(
    ['route-start-abc', 'group-marker', 'single-local', 'route-end-abc'],
    {
      markerOrderClientIdsByMarkerId: {
        'group-marker': ['syncedA', 'syncedB'],
      },
      primaryOrderClientIdByMarkerId: {
        'group-marker': 'syncedA',
      },
      markerIdByOrderClientId: {
        syncedA: 'group-marker',
        syncedB: 'group-marker',
      },
    },
  )

  assert(expanded.length === 3, 'marker expansion should include grouped ids and non-boundary singles only')
  assert(expanded.includes('syncedA') && expanded.includes('syncedB'), 'group marker should expand to grouped local ids')
  assert(expanded.includes('single-local'), 'single local marker should stay selectable')
}
