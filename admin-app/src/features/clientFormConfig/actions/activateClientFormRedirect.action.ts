import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useActivateClientFormRedirect } from '../api/clientFormRedirects.api'
import {
  readClientFormRedirects,
  setActiveClientFormRedirect,
} from '../store/clientFormRedirects.store'
import type { ClientFormRedirect } from '../types/clientFormRedirect'

/**
 * Optimistically marks the chosen page active (or none, for `null`), then asks
 * the backend to do the same. On failure the previous choice is restored.
 */
export const useActivateClientFormRedirectAction = () => {
  const activateRequest = useActivateClientFormRedirect()
  const { showMessage } = useMessageHandler()

  return useCallback(
    async (redirect: ClientFormRedirect | null) => {
      if (redirect && typeof redirect.id !== 'number') {
        showMessage({
          status: 400,
          message: 'This redirect page is still saving. Try again in a moment.',
        })
        return false
      }

      const previous = readClientFormRedirects().find((row) => row.is_active) ?? null
      setActiveClientFormRedirect(redirect?.client_id ?? null)

      try {
        await activateRequest(redirect?.id ?? null)
        return true
      } catch (error) {
        console.error('Failed to activate client form redirect', error)
        setActiveClientFormRedirect(previous?.client_id ?? null)
        showMessage(readClientFormFailure(error, 'Unable to change the redirect page.'))
        return false
      }
    },
    [activateRequest, showMessage],
  )
}
