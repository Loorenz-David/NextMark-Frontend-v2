import type { Item } from '../types'

export type ItemDelta = {
  weight: number
  volume: number
  count: number
}

export const computeItemDelta = (item: Item): ItemDelta => {
  const qty = item.quantity ?? 1
  const weight = (item.weight ?? 0) * qty
  const depth = item.dimension_depth ?? 0
  const height = item.dimension_height ?? 0
  const width = item.dimension_width ?? 0
  const volume = depth * height * width * qty
  return { weight, volume, count: qty }
}
