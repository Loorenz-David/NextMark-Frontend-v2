import { useEffect, useMemo, useState } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useGetOrderItems } from '../../../item'
import type { Item } from '../../../item'
import type { OrderFormMode } from '../state/OrderForm.types'
import { mapItemsFromTable } from '../../../api/mappers/orderForm.mappers'

export const useOrderFormItemsFlow = ({
  mode,
  orderServerId,
}: {
  mode: OrderFormMode
  orderServerId: number | null
}) => {
  const getOrderItems = useGetOrderItems()
  const { showMessage } = useMessageHandler()
  const [initialItems, setInitialItems] = useState<Item[]>([])
  const [isLoadingInitialItems, setIsLoadingInitialItems] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadInitialItems = async () => {
      if (mode !== 'edit' || typeof orderServerId !== 'number') {
        setInitialItems([])
        setIsLoadingInitialItems(false)
        return
      }

      setIsLoadingInitialItems(true)
      try {
        const response = await getOrderItems(orderServerId)
        const payloadItems = response.data?.items

        if (!payloadItems) {
          showMessage({ status: 400, message: 'Missing items response.' })
          if (isActive) {
            setInitialItems([])
          }
          return
        }

        const normalized = mapItemsFromTable(payloadItems).map((item) => ({
          ...item,
          order_id: item.order_id ?? orderServerId,
        }))

        if (isActive) {
          setInitialItems(normalized)
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load items.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        if (isActive) {
          setInitialItems([])
        }
      } finally {
        if (isActive) {
          setIsLoadingInitialItems(false)
        }
      }
    }

    void loadInitialItems()

    return () => {
      isActive = false
    }
  }, [getOrderItems, mode, orderServerId, showMessage])

  const itemInitialByClientId = useMemo(
    () =>
      initialItems.reduce<Record<string, Item>>((acc, item) => {
        acc[item.client_id] = item
        return acc
      }, {}),
    [initialItems],
  )

  return {
    initialItems,
    isLoadingInitialItems,
    itemInitialByClientId,
  }
}
