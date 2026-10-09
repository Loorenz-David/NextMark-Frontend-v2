import { useCallback, useMemo } from 'react'

import { useActivateClientFormRedirectAction } from '../actions/activateClientFormRedirect.action'
import { useClientFormConfigActions } from '../actions/clientFormConfigPopups.action'
import { useSaveClientFormRedirectAction } from '../actions/saveClientFormRedirect.action'
import { useClientFormRedirects } from '../store/clientFormConfig.selector'
import type { ClientFormRedirect } from '../types/clientFormRedirect'

export const MAX_CLIENT_FORM_REDIRECTS = 20

export const useClientFormRedirectsController = () => {
  const redirects = useClientFormRedirects()
  const actions = useClientFormConfigActions()
  const activateRedirect = useActivateClientFormRedirectAction()
  const { deleteRedirect } = useSaveClientFormRedirectAction()

  const activeClientId = useMemo(
    () => redirects.find((redirect) => redirect.is_active)?.client_id ?? null,
    [redirects],
  )

  const activate = useCallback(
    (redirect: ClientFormRedirect | null) => {
      if ((redirect?.client_id ?? null) === activeClientId) {
        return
      }
      void activateRedirect(redirect)
    },
    [activateRedirect, activeClientId],
  )

  const removeRedirect = useCallback(
    (redirect: ClientFormRedirect) => {
      void deleteRedirect(redirect)
    },
    [deleteRedirect],
  )

  return {
    redirects,
    activeClientId,
    canCreate: redirects.length < MAX_CLIENT_FORM_REDIRECTS,
    openCreate: () => actions.openRedirectForm('create'),
    openEdit: (clientId: string) => actions.openRedirectForm('edit', clientId),
    activate,
    removeRedirect,
  }
}
