import type { Item } from './item'

export type ItemPopupPayload =
  | {
      mode: 'autonomous'
      orderId: number
      itemId?: string
    }
  | {
      mode: 'controlled'
      orderId: number
      initialItem?: Item
      onSubmit: (draft: Item) => void
      onDelete?: (itemId: string) => void
    }
