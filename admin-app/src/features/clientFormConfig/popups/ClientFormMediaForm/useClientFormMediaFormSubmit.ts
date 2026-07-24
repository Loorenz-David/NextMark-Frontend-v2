import { useCallback } from 'react'
import type { RefObject } from 'react'

import { hasFormChanges } from '@shared-domain'
import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'

import { buildClientId } from '@/lib/utils/clientId'

import { useClientFormConfigActions } from '../../actions/clientFormConfigPopups.action'
import { useSaveClientFormMediaAction } from '../../actions/saveClientFormMedia.action'
import { useClientFormMediaByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormMediaUpdateFields } from '../../types/clientFormMedia'
import type {
  ClientFormMediaFormPayload,
  ClientFormMediaFormState,
} from './ClientFormMediaForm.types'

const toNullable = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const buildFields = (state: ClientFormMediaFormState) => ({
  placement: state.placement,
  url: state.url.trim(),
  alt_text: toNullable(state.alt_text),
  link_url: toNullable(state.link_url),
  title: toNullable(state.title),
  description: toNullable(state.description),
  enabled: state.enabled,
})

export const useClientFormMediaFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ClientFormMediaFormPayload
  formState: ClientFormMediaFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ClientFormMediaFormState | null>
}) => {
  const existing = useClientFormMediaByClientId(payload.clientId ?? null)
  const { createMedia, updateMedia, deleteMedia } = useSaveClientFormMediaAction()
  const { closeMediaForm } = useClientFormConfigActions()
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
      const created = await createMedia({
        client_id: buildClientId('client_form_media'),
        ...buildFields(formState),
      })
      if (created) {
        closeMediaForm()
      }
      return
    }

    const initial = initialFormRef.current
    if (!existing || !initial) {
      showMessage({ status: 400, message: 'This media item is no longer available.' })
      return
    }

    // Only the fields the user actually touched are sent — PATCH is partial.
    const diff = getObjectDiff(
      buildFields(initial),
      buildFields(formState),
    ) as ClientFormMediaUpdateFields
    const updated = await updateMedia(existing, diff)
    if (updated) {
      closeMediaForm()
    }
  }, [
    closeMediaForm,
    createMedia,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateMedia,
    validateForm,
  ])

  const handleDelete = useCallback(async () => {
    if (!existing) {
      showMessage({ status: 400, message: 'This media item is no longer available.' })
      return
    }
    const removed = await deleteMedia(existing)
    if (removed) {
      closeMediaForm()
    }
  }, [closeMediaForm, deleteMedia, existing, showMessage])

  return { handleSave, handleDelete }
}
