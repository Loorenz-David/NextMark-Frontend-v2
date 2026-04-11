import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { Order } from '@/features/order/types/order'
import { useOrderStore } from '@/features/order/store/order.store'

import { useLocalDeliverySelectionStore } from './localDeliverySelection.store'

export const buildSelectedLocalDeliveryOrdersSummary = (
  selectedIds: string[],
  byClientId: Record<string, Order>,
) => {
  const orders = selectedIds.reduce<Order[]>((acc, clientId) => {
    const order = byClientId[clientId]
    if (order) {
      acc.push(order)
    }
    return acc
  }, [])

  const totalWeight = orders.reduce((acc, order) => acc + (order.total_weight ?? 0), 0)
  const totalItems = orders.reduce((acc, order) => acc + (order.total_items ?? 0), 0)
  const totalVolume = orders.reduce((acc, order) => acc + (order.total_volume ?? 0), 0)

  return {
    count: orders.length,
    orders,
    totalWeight,
    totalItems,
    totalVolume,
  }
}

export const useLocalDeliverySelectionMode = () =>
  useLocalDeliverySelectionStore((state) => state.isSelectionMode)

export const useSelectedLocalDeliveryClientIds = () =>
  useLocalDeliverySelectionStore((state) => state.selectedClientIds)

export const useSelectedLocalDeliveryServerIds = () =>
  useLocalDeliverySelectionStore((state) => state.selectedServerIds)

export const useLocalDeliverySelectionActions = () =>
  useLocalDeliverySelectionStore(
    useShallow((state) => ({
      enableSelectionMode: state.enableSelectionMode,
      disableSelectionMode: state.disableSelectionMode,
      setSelectedOrders: state.setSelectedOrders,
      clearSelection: state.clearSelection,
    })),
  )

export const useSelectedLocalDeliveryOrdersSummary = () => {
  const selectedClientIds = useSelectedLocalDeliveryClientIds()
  const byClientId = useOrderStore((state) => state.byClientId)

  return useMemo(
    () => buildSelectedLocalDeliveryOrdersSummary(selectedClientIds, byClientId),
    [byClientId, selectedClientIds],
  )
}

