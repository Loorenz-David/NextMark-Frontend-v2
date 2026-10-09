import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useGetClientFormRedirects } from '../api/clientFormRedirects.api'
import { replaceClientFormRedirects } from '../store/clientFormRedirects.store'

export const useClientFormRedirectsFlow = () => {
  const getRedirects = useGetClientFormRedirects()
  const { showMessage } = useMessageHandler()

  const loadRedirects = useCallback(async () => {
    try {
      const response = await getRedirects()
      const redirects = response.data?.client_form_redirects
      if (!redirects) {
        showMessage({ status: 500, message: 'Missing client form redirects response.' })
        return null
      }
      // The list is the whole team collection, so it replaces rather than merges.
      replaceClientFormRedirects(redirects)
      return redirects
    } catch (error) {
      console.error('Failed to load client form redirects', error)
      showMessage(readClientFormFailure(error, 'Unable to load the redirect pages.'))
      return null
    }
  }, [getRedirects, showMessage])

  useEffect(() => {
    void loadRedirects()
  }, [loadRedirects])

  return { loadRedirects }
}
