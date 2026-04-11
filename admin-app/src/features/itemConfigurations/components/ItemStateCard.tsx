import { useMessageHandler } from '@shared-message-handler'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { useDeleteItemState } from '../api/itemStateApi'
import { upsertItemState, removeItemState } from '../store/itemStateStore'
import type { ItemState } from '../types/itemState'

type ItemStateCardProps = {
  item: ItemState
  onEdit: (clientId: string) => void
}

export const ItemStateCard = ({ item, onEdit }: ItemStateCardProps) => {
  const deleteItemState = useDeleteItemState()
  const { showMessage } = useMessageHandler()

  const handleDelete = async () => {
    if (!item.id || item.is_system) return
    const snapshot = { ...item }
    removeItemState(item.client_id)
    try {
      await deleteItemState(item.id)
    } catch {
      upsertItemState(snapshot as never)
      showMessage({ status: 500, message: 'Unable to delete item state.' })
    }
  }

  return (
    <div className="w-80 rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 shadow-none">
      <div
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 h-4 w-4 shrink-0 rounded-md border border-[var(--color-border)]"
            style={{ backgroundColor: item.color || 'transparent' }}
          />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
            <p className="text-xs text-[var(--color-muted)]">{item.description ?? 'No description'}</p>
          </div>
        </div>
        {item.is_system ? null : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
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
        )}
      </div>
      
    </div>
  )
}

