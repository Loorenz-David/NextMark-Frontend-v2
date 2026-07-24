import { useCallback, useMemo } from 'react'

import { arrayMove } from '@dnd-kit/sortable'

import { useClientFormConfigActions } from '../actions/clientFormConfigPopups.action'
import { useReorderClientFormMediaAction } from '../actions/reorderClientFormMedia.action'
import { useSaveClientFormMediaAction } from '../actions/saveClientFormMedia.action'
import { groupMediaByPlacement } from '../domain/clientFormConfig.rules'
import { MEDIA_PLACEMENTS, type MediaPlacement } from '../domain/mediaPlacement'
import { useClientFormMediaItems } from '../store/clientFormConfig.selector'
import type { ClientFormMedia } from '../types/clientFormMedia'

export const useClientFormMediaController = () => {
  const media = useClientFormMediaItems()
  const actions = useClientFormConfigActions()
  const reorderMedia = useReorderClientFormMediaAction()
  const { updateMedia, deleteMedia } = useSaveClientFormMediaAction()

  const grouped = useMemo(() => groupMediaByPlacement(media), [media])

  const placements = useMemo(
    () => MEDIA_PLACEMENTS.map((placement) => ({ placement, items: grouped[placement] })),
    [grouped],
  )

  /** Reorder is placement-scoped: only the items in `placement` may be sent. */
  const handleReorder = useCallback(
    (placement: MediaPlacement, activeClientId: string, overClientId: string) => {
      if (activeClientId === overClientId) {
        return
      }

      const items = grouped[placement]
      const oldIndex = items.findIndex((item) => item.client_id === activeClientId)
      const newIndex = items.findIndex((item) => item.client_id === overClientId)
      if (oldIndex < 0 || newIndex < 0) {
        return
      }

      void reorderMedia(placement, arrayMove(items, oldIndex, newIndex))
    },
    [grouped, reorderMedia],
  )

  const toggleEnabled = useCallback(
    (item: ClientFormMedia, enabled: boolean) => {
      void updateMedia(item, { enabled })
    },
    [updateMedia],
  )

  const removeMedia = useCallback(
    (item: ClientFormMedia) => {
      void deleteMedia(item)
    },
    [deleteMedia],
  )

  return {
    placements,
    totalCount: media.length,
    openCreate: (placement: MediaPlacement) => actions.openMediaForm('create', undefined, placement),
    openEdit: (clientId: string) => actions.openMediaForm('edit', clientId),
    handleReorder,
    toggleEnabled,
    removeMedia,
  }
}
