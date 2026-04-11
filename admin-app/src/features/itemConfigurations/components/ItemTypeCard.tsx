import { useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { useDeleteItemType } from '../api/itemTypeApi'
import { upsertItemType, removeItemType } from '../store/itemTypeStore'
import { upsertItemProperty, useItemPropertyStore } from '../store/itemPropertyStore'
import type { ItemType } from '../types/itemType'

type ItemTypeCardProps = {
  item: ItemType
  onEdit: (clientId: string) => void
}

export const ItemTypeCard = ({ item, onEdit }: ItemTypeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const deleteItemType = useDeleteItemType()
  const { showMessage } = useMessageHandler()

  const handleDelete = async () => {
    if (!item.id) return
    const snapshot = { ...item }
    removeItemType(item.client_id)
    // Remove this type's ID from all linked item properties
    const allProps = Object.values(useItemPropertyStore.getState().byClientId)
    for (const prop of allProps) {
      if (!prop.item_types?.includes(item.id)) continue
      upsertItemProperty({ ...prop, item_types: prop.item_types.filter((t) => t !== item.id) })
    }
    try {
      await deleteItemType(item.id)
    } catch {
      upsertItemType(snapshot)
      showMessage({ status: 500, message: 'Unable to delete item type.' })
    }
  }

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 shadow-none">
      <div
        role="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(item.client_id)
            }}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Edit
          </button>
          <ConfirmActionButton
            onConfirm={handleDelete}
            deleteContent="Delete"
            confirmContent="Confirm"
            deleteClassName="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-red-400 hover:text-red-300"
            confirmClassName="rounded-full px-3 py-1 text-xs text-white"
          />
        </div>
      </div>
      {isExpanded ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4 text-xs text-[var(--color-muted)]">
          Properties: {item.properties?.length ?? 0}
        </div>
      ) : null}
    </div>
  )
}

