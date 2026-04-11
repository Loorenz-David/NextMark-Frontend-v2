import { useMemo } from 'react'

import { useOrdersByCostumerServerId } from '@/features/order'

import { useCostumerOrdersHydration } from '../flows/useCostumerOrdersHydration.flow'

export const useCostumerOrders = ({
  costumerId,
  activeOrderCount,
}: {
  costumerId: number | null
  activeOrderCount: number
}) => {
  const orders = useOrdersByCostumerServerId(costumerId)
  const knownCount = orders.length

  useCostumerOrdersHydration({
    costumerId,
    activeOrderCount,
    knownCount,
  })

  return useMemo(
    () => ({
      orders,
      knownCount,
      activeOrderCount,
    }),
    [activeOrderCount, knownCount, orders],
  )
}

