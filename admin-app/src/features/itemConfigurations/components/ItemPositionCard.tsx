import { useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { useDeleteItemPosition } from '../api/itemPositionApi'
import { upsertItemPosition, removeItemPosition } from '../store/itemPositionStore'
import type { ItemPosition } from '../types/itemPosition'

type ItemPositionCardProps = {
  item: ItemPosition
  onEdit: (clientId: string) => void
}

export const ItemPositionCard = ({ item, onEdit }: ItemPositionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const deleteItemPosition = useDeleteItemPosition()
  const { showMessage } = useMessageHandler()

  const handleDelete = async () => {
    if (!item.id) return
    const snapshot = { ...item }
    removeItemPosition(item.client_id)
    try {
      await deleteItemPosition(item.id)
    } catch {
      upsertItemPosition(snapshot)
      showMessage({ status: 500, message: 'Unable to delete item position.' })
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
          <p className="text-xs text-[var(--color-muted)]">
            Default: {item.default ? 'Yes' : 'No'}
          </p>
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
          {item.description ?? 'No description'}
        </div>
      ) : null}
    </div>
  )
}

