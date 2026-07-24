import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useGetClientFormMedia } from '../api/clientFormMedia.api'
import { replaceClientFormMedia } from '../store/clientFormMedia.store'

export const useClientFormMediaFlow = () => {
  const getMedia = useGetClientFormMedia()
  const { showMessage } = useMessageHandler()

  const loadMedia = useCallback(async () => {
    try {
      const response = await getMedia()
      const media = response.data?.client_form_media
      if (!media) {
        showMessage({ status: 500, message: 'Missing client form media response.' })
        return null
      }
      // The list is the whole team collection, so it replaces rather than merges.
      replaceClientFormMedia(media)
      return media
    } catch (error) {
      console.error('Failed to load client form media', error)
      showMessage(readClientFormFailure(error, 'Unable to load the media.'))
      return null
    }
  }, [getMedia, showMessage])

  useEffect(() => {
    void loadMedia()
  }, [loadMedia])

  return { loadMedia }
}
