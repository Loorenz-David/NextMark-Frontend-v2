import { BasicButton } from '@/shared/buttons/BasicButton'

import { ItemCard } from '../ItemCard'
import type { ItemsOrderPreviewLayoutProps } from './ItemsOrderPreview.types'

export const ItemsOrderPreviewDefaultLayout = ({
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
}: ItemsOrderPreviewLayoutProps) => (
  <section className="flex h-full min-h-0 w-full flex-col">
    {header ?? (
      <div className="flex items-center justify-between gap-3 bg-[var(--color-page)] px-5 py-5 shadow-md">
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
    )}

    <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-5">
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
  </section>
)

