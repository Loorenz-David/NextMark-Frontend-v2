import { buildClientId } from '@/lib/utils/clientId'

import type { Item, ItemPopupPayload } from '../../../types'


const buildDefaultItemDraft = (orderId: number): Item => ({
  client_id: buildClientId('item'),
  order_id: orderId,
  article_number: '',
  item_type: '',
  item_position: null,
  quantity: 1,
})

export const buildInitialItemDraft = ({
  payload,
  existingItem,
}: {
  payload: ItemPopupPayload
  existingItem: Item | null
}): Item => {
  if (payload.mode === 'controlled' && payload.initialItem) {
    return {
      ...payload.initialItem,
      order_id: payload.orderId,
    }
  }

  if (payload.mode === 'autonomous' && existingItem) {
    return existingItem
  }

  return buildDefaultItemDraft(payload.orderId)
}
