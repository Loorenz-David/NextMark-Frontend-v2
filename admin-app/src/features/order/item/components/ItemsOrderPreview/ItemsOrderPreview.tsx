import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { useItemRules } from '../../domain/useItemRules'
import { useItemActions } from '../../hooks/useItemActions'
import { shouldRefreshItemsForOrder, useItemFlow } from '../../hooks/useItemFlow'
import type { Item } from '../../types'
import { ItemCard } from '../ItemCard'
import { ItemsOrderPreviewDefaultLayout } from './ItemsOrderPreviewDefault.layout'
import { ItemsOrderPreviewScrollLayout } from './ItemsOrderPreviewScroll.layout'
import { ItemsOrderPreviewStickyLayout } from './ItemsOrderPreviewSticky.layout'

export type ItemsOrderPreviewProps = {
  orderId?: number
  controlled?: boolean
  items?: Item[]
  expectedItemCount?: number | null
  itemsUpdatedAt?: string | null
  header?: ReactNode
  onAddItem?: () => void
  onEditItem?: (item: Item) => void
  stickyHeader?: boolean
  scrollBody?:boolean
}

export const ItemsOrderPreview = ({
  orderId,
  controlled = false,
  items: controlledItems,
  expectedItemCount,
  itemsUpdatedAt,
  header,
  onAddItem,
  onEditItem,
  scrollBody = false,
  stickyHeader = false,
}: ItemsOrderPreviewProps) => {
  const { loadItemsByOrderId, isLoadingItems, items: flowItems } = useItemFlow({ orderId: orderId ?? null })
  const { openCreateItem, openEditItem } = useItemActions()
  const { calculateOrderItemStats } = useItemRules()
  const [expandedItemClientId, setExpandedItemClientId] = useState<string | null>(null)

  useEffect(() => {
    if (controlled || typeof orderId !== 'number') return
    if (
      !shouldRefreshItemsForOrder({
        orderId,
        itemsUpdatedAt,
        expectedItemCount,
      })
    ) {
      return
    }
    void loadItemsByOrderId(orderId, { itemsUpdatedAt })
  }, [controlled, expectedItemCount, itemsUpdatedAt, loadItemsByOrderId, orderId])

  const resolvedItems: Item[] = controlled ? (controlledItems ?? []) : flowItems
  const resolvedLoading = controlled ? false : isLoadingItems
  const stats = calculateOrderItemStats(resolvedItems)

  useEffect(() => {
    if (expandedItemClientId == null) return
    const currentItems = controlled ? (controlledItems ?? []) : flowItems
    const stillExists = currentItems.some((entry) => entry.client_id === expandedItemClientId)
    if (!stillExists) {
      setExpandedItemClientId(null)
    }
  }, [controlled, controlledItems, expandedItemClientId, flowItems])

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem()
      return
    }

    if (typeof orderId !== 'number') return
    openCreateItem(orderId)
  }

  const commonLayoutProps = {
    header,
    resolvedLoading,
    resolvedItems,
    controlled,
    expandedItemClientId,
    onToggleExpand: (clientId: string) => {
      setExpandedItemClientId((current) => (current === clientId ? null : clientId))
    },
    onEditItem,
    orderId,
    onOpenEditItem: openEditItem,
    onAddItem: handleAddItem,
    totalItems: stats.totalItems,
    totalWeight: stats.totalWeight,
    totalVolume: stats.totalVolume,
    testNodes: [],
  }

  if (stickyHeader) {
    return (
      <ItemsOrderPreviewStickyLayout
        {...commonLayoutProps}
        enableScrollBody={scrollBody}
      />
    )
  }

  if (scrollBody) {
    return <ItemsOrderPreviewScrollLayout {...commonLayoutProps} />
  }

  return (
    <ItemsOrderPreviewDefaultLayout
      {...commonLayoutProps}
    />
  )
}


