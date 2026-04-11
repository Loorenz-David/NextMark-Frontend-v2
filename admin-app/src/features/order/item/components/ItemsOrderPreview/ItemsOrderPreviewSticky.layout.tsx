import { BasicButton } from '@/shared/buttons/BasicButton'

import { ItemCard } from '../ItemCard'
import type { ItemsOrderPreviewLayoutProps } from './ItemsOrderPreview.types'

type ItemsOrderPreviewStickyLayoutProps = ItemsOrderPreviewLayoutProps & {
  enableScrollBody?: boolean
}

export const ItemsOrderPreviewStickyLayout = ({
  header,
  resolvedLoading,
  resolvedItems,
  controlled,
  expandedItemClientId,
  onToggleExpand,
  onEditItem,
  orderId,
  onOpenEditItem,
  onAddItem,
  totalItems,
  totalWeight,
  totalVolume,
  testNodes,
  enableScrollBody = false,
}: ItemsOrderPreviewStickyLayoutProps) => {
  const defaultHeader = (
    <div className="sticky top-0  flex items-center justify-between gap-3 bg-[var(--color-page)] px-5 py-5 shadow-md">
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">Items</p>
        <p className="text-xs text-[var(--color-muted)]">
          {totalItems} items • {totalWeight.toFixed(2)} kg • {totalVolume.toFixed(2)} ㎥
        </p>
      </div>

      <BasicButton params={{ variant: 'primary', onClick: onAddItem, ariaLabel: 'Add item' }}>
        + Item
      </BasicButton>
    </div>
  )

  const renderBody = (useFillHeight: boolean) => (
    <div className={useFillHeight ? 'flex min-h-0 flex-1 flex-col gap-3 px-5 py-5' : 'flex flex-col gap-3 px-5 py-5'}>
      {resolvedLoading ? (
        <div className="text-xs text-[var(--color-muted)]">Loading items...</div>
      ) : resolvedItems.length ? (
        resolvedItems.map((item) => (
          <ItemCard
            key={item.client_id}
            item={item}
            showDelete={!controlled}
            isExpanded={expandedItemClientId === item.client_id}
            onToggleExpand={() => onToggleExpand(item.client_id)}
            onEdit={
              onEditItem
                ? () => onEditItem(item)
                : () => {
                    if (typeof orderId !== 'number') return
                    onOpenEditItem(orderId, item.client_id)
                  }
            }
          />
        ))
      ) : (
        <div className="text-xs text-[var(--color-muted)]">No items yet.</div>
      )}

      {testNodes.map((node) => node)}
    </div>
  )

  if (enableScrollBody) {
    return (
      <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto scroll-thin">
          {header ?? defaultHeader}
          {renderBody(false)}
        </div>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col">
      {header ?? defaultHeader}
      {renderBody(false)}
    </section>
  )
}
