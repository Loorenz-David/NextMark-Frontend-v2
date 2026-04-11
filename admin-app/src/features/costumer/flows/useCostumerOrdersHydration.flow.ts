import { useEffect, useRef } from 'react'

import { setLoadingOrders } from '../store/costumerDetailUI.store'
import { useCostumerQueries } from '../controllers/costumerQueries.controller'

const DEFAULT_PAGE_SIZE = 50

export const useCostumerOrdersHydration = ({
  costumerId,
  activeOrderCount,
  knownCount,
}: {
  costumerId: number | null
  activeOrderCount: number
  knownCount: number
}) => {
  const { queryCostumerOrdersByServerId } = useCostumerQueries()
  const inFlightRef = useRef<Map<number, boolean>>(new Map())

  useEffect(() => {
    if (typeof costumerId !== 'number') {
      return
    }

    if (!Number.isFinite(activeOrderCount) || activeOrderCount <= 0) {
      setLoadingOrders(costumerId, null)
      return
    }

    if (knownCount >= activeOrderCount) {
      setLoadingOrders(costumerId, null)
      return
    }

    if (inFlightRef.current.get(costumerId)) {
      return
    }

    inFlightRef.current.set(costumerId, true)
    const loadingLabel = knownCount === 0 ? 'Loading orders...' : 'Loading more orders...'
    setLoadingOrders(costumerId, loadingLabel)

    const load = async () => {
      try {
        await queryCostumerOrdersByServerId(costumerId, {
          limit: DEFAULT_PAGE_SIZE,
          offset: knownCount,
        })
      } finally {
        inFlightRef.current.set(costumerId, false)
        if (knownCount + DEFAULT_PAGE_SIZE >= activeOrderCount) {
          setLoadingOrders(costumerId, null)
        }
      }
    }

    void load()
  }, [activeOrderCount, costumerId, knownCount, queryCostumerOrdersByServerId])

  useEffect(
    () => () => {
      if (typeof costumerId === 'number') {
        setLoadingOrders(costumerId, null)
      }
    },
    [costumerId],
  )
}

