import { useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { useDeleteItemProperty } from '../api/itemPropertyApi'
import { upsertItemProperty, removeItemProperty } from '../store/itemPropertyStore'
import { upsertItemType, useItemTypeStore } from '../store/itemTypeStore'
import type { ItemProperty } from '../types/itemProperty'

type ItemPropertyCardProps = {
  item: ItemProperty
  onEdit: (clientId: string) => void
}

export const ItemPropertyCard = ({ item, onEdit }: ItemPropertyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const deleteItemProperty = useDeleteItemProperty()
  const { showMessage } = useMessageHandler()

  const handleDelete = async () => {
    if (!item.id) return
    const snapshot = { ...item }
    removeItemProperty(item.client_id)
    // Remove this property's ID from all linked item types
    const allTypes = Object.values(useItemTypeStore.getState().byClientId)
    for (const type of allTypes) {
      if (!type.properties?.includes(item.id)) continue
      upsertItemType({ ...type, properties: type.properties.filter((p) => p !== item.id) })
    }
    try {
      await deleteItemProperty(item.id)
    } catch {
      upsertItemProperty(snapshot)
      showMessage({ status: 500, message: 'Unable to delete item property.' })
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface-raised px-5 py-4 shadow-none">
      <div
        role="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
          <p className="text-xs text-[var(--color-muted)]">Type: {item.field_type ?? '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(item.client_id)
            }}
            className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Edit
          </button>
          <ConfirmActionButton
            onConfirm={handleDelete}
            deleteContent="Delete"
            confirmContent="Confirm"
            deleteClassName="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-danger hover:text-danger"
            confirmClassName="rounded-full px-3 py-1 text-xs text-text"
          />
        </div>
      </div>
      {isExpanded ? (
        <div className="mt-4 border-t border-border-subtle pt-4 text-xs text-[var(--color-muted)]">
          Required: {item.required ? 'Yes' : 'No'}
        </div>
      ) : null}
    </div>
  )
}

