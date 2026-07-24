import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { readCreatedId } from '../api/clientFormCreateResponse'
import {
  useCreateClientFormMedia,
  useDeleteClientFormMedia,
  useUpdateClientFormMedia,
} from '../api/clientFormMedia.api'
import type { MediaPlacement } from '../domain/mediaPlacement'
import {
  readClientFormMedia,
  removeClientFormMediaItem,
  upsertClientFormMediaItem,
} from '../store/clientFormMedia.store'
import type {
  ClientFormMedia,
  ClientFormMediaCreateFields,
  ClientFormMediaUpdateFields,
} from '../types/clientFormMedia'

/** Positions are 0-based within a placement, so the next slot is placement-scoped. */
const nextPositionInPlacement = (media: ClientFormMedia[], placement: MediaPlacement) =>
  media.reduce(
    (highest, item) => (item.placement === placement ? Math.max(highest, item.position + 1) : highest),
    0,
  )

export const useSaveClientFormMediaAction = () => {
  const createMediaRequest = useCreateClientFormMedia()
  const updateMediaRequest = useUpdateClientFormMedia()
  const deleteMediaRequest = useDeleteClientFormMedia()
  const { showMessage } = useMessageHandler()

  const createMedia = useCallback(
    async (fields: ClientFormMediaCreateFields) => {
      const optimistic: ClientFormMedia = {
        client_id: fields.client_id,
        placement: fields.placement,
        position: nextPositionInPlacement(readClientFormMedia(), fields.placement),
        enabled: fields.enabled ?? true,
        url: fields.url,
        alt_text: fields.alt_text ?? null,
        link_url: fields.link_url ?? null,
        title: fields.title ?? null,
        description: fields.description ?? null,
      }
      upsertClientFormMediaItem(optimistic)

      try {
        const response = await createMediaRequest(fields)
        const serverId = readCreatedId(response.data, fields.client_id)
        if (serverId !== null) {
          upsertClientFormMediaItem({ ...optimistic, id: serverId })
        }
        return true
      } catch (error) {
        console.error('Failed to create client form media', error)
        removeClientFormMediaItem(fields.client_id)
        showMessage(readClientFormFailure(error, 'Unable to create the media item.'))
        return false
      }
    },
    [createMediaRequest, showMessage],
  )

  const updateMedia = useCallback(
    async (media: ClientFormMedia, fields: ClientFormMediaUpdateFields) => {
      if (typeof media.id !== 'number') {
        showMessage({ status: 400, message: 'This item is still saving. Try again in a moment.' })
        return false
      }

      const snapshot = { ...media }
      // Moving to another placement invalidates the position; the server reassigns it.
      const movedPlacement =
        fields.placement !== undefined && fields.placement !== media.placement
          ? { position: nextPositionInPlacement(readClientFormMedia(), fields.placement) }
          : {}
      upsertClientFormMediaItem({ ...media, ...fields, ...movedPlacement })

      try {
        await updateMediaRequest(media.id, fields)
        return true
      } catch (error) {
        console.error('Failed to update client form media', error)
        upsertClientFormMediaItem(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to update the media item.'))
        return false
      }
    },
    [showMessage, updateMediaRequest],
  )

  const deleteMedia = useCallback(
    async (media: ClientFormMedia) => {
      if (typeof media.id !== 'number') {
        showMessage({ status: 400, message: 'This item is still saving. Try again in a moment.' })
        return false
      }

      const snapshot = { ...media }
      removeClientFormMediaItem(media.client_id)

      try {
        await deleteMediaRequest(media.id)
        return true
      } catch (error) {
        console.error('Failed to delete client form media', error)
        upsertClientFormMediaItem(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to delete the media item.'))
        return false
      }
    },
    [deleteMediaRequest, showMessage],
  )

  return { createMedia, updateMedia, deleteMedia }
}
