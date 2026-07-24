import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useReorderClientFormMedia } from '../api/clientFormMedia.api'
import { collectReorderIds } from '../domain/clientFormConfig.rules'
import type { MediaPlacement } from '../domain/mediaPlacement'
import { readClientFormMedia, upsertClientFormMediaItem } from '../store/clientFormMedia.store'
import type { ClientFormMedia } from '../types/clientFormMedia'

/**
 * Media reorder is scoped to a single placement — `orderedItems` must be every
 * item in that placement, and nothing from another one.
 */
export const useReorderClientFormMediaAction = () => {
  const reorderMedia = useReorderClientFormMedia()
  const { showMessage } = useMessageHandler()

  return useCallback(
    async (placement: MediaPlacement, orderedItems: ClientFormMedia[]) => {
      const orderedIds = collectReorderIds(orderedItems)
      if (!orderedIds) {
        showMessage({
          status: 400,
          message: 'Wait for every media item to finish saving before reordering.',
        })
        return false
      }

      const snapshot = readClientFormMedia()
      orderedItems.forEach((item, index) =>
        upsertClientFormMediaItem({ ...item, position: index }),
      )

      try {
        await reorderMedia(placement, orderedIds)
        return true
      } catch (error) {
        console.error('Failed to reorder client form media', error)
        snapshot.forEach((item) => upsertClientFormMediaItem(item))
        showMessage(readClientFormFailure(error, 'Unable to reorder the media.'))
        return false
      }
    },
    [reorderMedia, showMessage],
  )
}
