import { useCallback } from 'react'
import type { RefObject } from 'react'

import { resolveClientFormRedirect } from '@client-form-kit'
import { hasFormChanges } from '@shared-domain'
import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'

import { buildClientId } from '@/lib/utils/clientId'

import { useClientFormConfigActions } from '../../actions/clientFormConfigPopups.action'
import { useSaveClientFormRedirectAction } from '../../actions/saveClientFormRedirect.action'
import { useClientFormRedirectByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormRedirectUpdateFields } from '../../types/clientFormRedirect'
import type {
  ClientFormRedirectFormPayload,
  ClientFormRedirectFormState,
} from './ClientFormRedirectForm.types'

/**
 * The URL is sent in the canonical form the browser parses it to (lower-case
 * host, punycode for international domains), which is also how the backend
 * stores it — so the list shows exactly the address customers are sent to.
 */
const buildFields = (state: ClientFormRedirectFormState) => ({
  label: state.label.trim(),
  url: resolveClientFormRedirect(state.url)?.href ?? state.url.trim(),
})

export const useClientFormRedirectFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ClientFormRedirectFormPayload
  formState: ClientFormRedirectFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ClientFormRedirectFormState | null>
}) => {
  const existing = useClientFormRedirectByClientId(payload.clientId ?? null)
  const { createRedirect, updateRedirect, deleteRedirect } = useSaveClientFormRedirectAction()
  const { closeRedirectForm } = useClientFormConfigActions()
  const { showMessage } = useMessageHandler()

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    if (payload.mode === 'create') {
      const created = await createRedirect({
        client_id: buildClientId('client_form_redirect'),
        ...buildFields(formState),
      })
      if (created) {
        closeRedirectForm()
      }
      return
    }

    const initial = initialFormRef.current
    if (!existing || !initial) {
      showMessage({ status: 400, message: 'This redirect page is no longer available.' })
      return
    }

    // Only the fields the user actually touched are sent — PATCH is partial.
    const diff = getObjectDiff(
      buildFields(initial),
      buildFields(formState),
    ) as ClientFormRedirectUpdateFields
    const updated = await updateRedirect(existing, diff)
    if (updated) {
      closeRedirectForm()
    }
  }, [
    closeRedirectForm,
    createRedirect,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateRedirect,
    validateForm,
  ])

  const handleDelete = useCallback(async () => {
    if (!existing) {
      showMessage({ status: 400, message: 'This redirect page is no longer available.' })
      return
    }
    const removed = await deleteRedirect(existing)
    if (removed) {
      closeRedirectForm()
    }
  }, [closeRedirectForm, deleteRedirect, existing, showMessage])

  return { handleSave, handleDelete }
}
