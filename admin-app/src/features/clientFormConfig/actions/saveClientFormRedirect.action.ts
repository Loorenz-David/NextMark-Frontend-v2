import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { readCreatedId } from '../api/clientFormCreateResponse'
import {
  useCreateClientFormRedirect,
  useDeleteClientFormRedirect,
  useUpdateClientFormRedirect,
} from '../api/clientFormRedirects.api'
import {
  removeClientFormRedirect,
  upsertClientFormRedirect,
} from '../store/clientFormRedirects.store'
import type {
  ClientFormRedirect,
  ClientFormRedirectCreateFields,
  ClientFormRedirectUpdateFields,
} from '../types/clientFormRedirect'

const STILL_SAVING = 'This redirect page is still saving. Try again in a moment.'

export const useSaveClientFormRedirectAction = () => {
  const createRedirectRequest = useCreateClientFormRedirect()
  const updateRedirectRequest = useUpdateClientFormRedirect()
  const deleteRedirectRequest = useDeleteClientFormRedirect()
  const { showMessage } = useMessageHandler()

  const createRedirect = useCallback(
    async (fields: ClientFormRedirectCreateFields) => {
      const optimistic: ClientFormRedirect = { ...fields, is_active: false }
      upsertClientFormRedirect(optimistic)

      try {
        const response = await createRedirectRequest(fields)
        const serverId = readCreatedId(response.data, fields.client_id)
        if (serverId !== null) {
          upsertClientFormRedirect({ ...optimistic, id: serverId })
        }
        return true
      } catch (error) {
        console.error('Failed to create client form redirect', error)
        removeClientFormRedirect(fields.client_id)
        showMessage(readClientFormFailure(error, 'Unable to save the redirect page.'))
        return false
      }
    },
    [createRedirectRequest, showMessage],
  )

  const updateRedirect = useCallback(
    async (redirect: ClientFormRedirect, fields: ClientFormRedirectUpdateFields) => {
      if (typeof redirect.id !== 'number') {
        showMessage({ status: 400, message: STILL_SAVING })
        return false
      }

      const snapshot = { ...redirect }
      upsertClientFormRedirect({ ...redirect, ...fields })

      try {
        await updateRedirectRequest(redirect.id, fields)
        return true
      } catch (error) {
        console.error('Failed to update client form redirect', error)
        upsertClientFormRedirect(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to update the redirect page.'))
        return false
      }
    },
    [showMessage, updateRedirectRequest],
  )

  /** Deleting the active page leaves the team with no redirect. */
  const deleteRedirect = useCallback(
    async (redirect: ClientFormRedirect) => {
      if (typeof redirect.id !== 'number') {
        showMessage({ status: 400, message: STILL_SAVING })
        return false
      }

      const snapshot = { ...redirect }
      removeClientFormRedirect(redirect.client_id)

      try {
        await deleteRedirectRequest(redirect.id)
        return true
      } catch (error) {
        console.error('Failed to delete client form redirect', error)
        upsertClientFormRedirect(snapshot)
        showMessage(readClientFormFailure(error, 'Unable to delete the redirect page.'))
        return false
      }
    },
    [deleteRedirectRequest, showMessage],
  )

  return { createRedirect, updateRedirect, deleteRedirect }
}
