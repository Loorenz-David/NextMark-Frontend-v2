import type { Item } from '../types'

export type OrderItemStats = {
  totalItems: number
  totalWeight: number
  totalVolume: number
}

type ItemStatCandidate = Pick<
  Item,
  'quantity' | 'weight' | 'dimension_width' | 'dimension_height' | 'dimension_depth'
>

export const useItemRules = () => {
  const itemBelongsToOrder = (item: Item, orderId: number) => item.order_id === orderId

  const canEditItem = (item: Item, orderId: number) => itemBelongsToOrder(item, orderId)

  const canDeleteItem = (item: Item, orderId: number) => itemBelongsToOrder(item, orderId)

  const GRAMS_PER_KILOGRAM = 1000
  const CUBIC_CENTIMETERS_PER_CUBIC_METER = 1_000_000

  const calculateOrderItemStats = (items: ItemStatCandidate[]): OrderItemStats =>
    items.reduce<OrderItemStats>(
      (acc, item) => {
        const quantity = item.quantity || 0
        const totalWeightKg = ((item.weight ?? 0) * quantity) / GRAMS_PER_KILOGRAM
        const totalVolumeM3 =
          ((item.dimension_width ?? 0) * (item.dimension_height ?? 0) * (item.dimension_depth ?? 0) * quantity)
          / CUBIC_CENTIMETERS_PER_CUBIC_METER

        return {
          totalItems: acc.totalItems + 1,
          totalWeight: acc.totalWeight + totalWeightKg,
          totalVolume: acc.totalVolume + totalVolumeM3,
        }
      },
      {
        totalItems: 0,
        totalWeight: 0,
        totalVolume: 0,
      },
    )

  return {
    itemBelongsToOrder,
    canEditItem,
    canDeleteItem,
    calculateOrderItemStats,
  }
}
