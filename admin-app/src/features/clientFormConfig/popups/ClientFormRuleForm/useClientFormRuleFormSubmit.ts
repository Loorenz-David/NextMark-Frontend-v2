import { useCallback } from 'react'
import type { RefObject } from 'react'

import { hasFormChanges } from '@shared-domain'
import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'

import { buildClientId } from '@/lib/utils/clientId'

import { useClientFormConfigActions } from '../../actions/clientFormConfigPopups.action'
import { useSaveClientFormRuleAction } from '../../actions/saveClientFormRule.action'
import { useClientFormRuleByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormRuleUpdateFields } from '../../types/clientFormRule'
import type { ClientFormRuleFormPayload, ClientFormRuleFormState } from './ClientFormRuleForm.types'

const toNullable = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const buildFields = (state: ClientFormRuleFormState) => ({
  title: state.title.trim(),
  body: toNullable(state.body),
  icon: toNullable(state.icon),
  image_url: toNullable(state.image_url),
  enabled: state.enabled,
})

export const useClientFormRuleFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ClientFormRuleFormPayload
  formState: ClientFormRuleFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ClientFormRuleFormState | null>
}) => {
  const existing = useClientFormRuleByClientId(payload.clientId ?? null)
  const { createRule, updateRule, deleteRule } = useSaveClientFormRuleAction()
  const { closeRuleForm } = useClientFormConfigActions()
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
      const created = await createRule({
        client_id: buildClientId('client_form_rule'),
        ...buildFields(formState),
      })
      if (created) {
        closeRuleForm()
      }
      return
    }

    const initial = initialFormRef.current
    if (!existing || !initial) {
      showMessage({ status: 400, message: 'This rule is no longer available.' })
      return
    }

    // Only the fields the user actually touched are sent — PATCH is partial.
    const diff = getObjectDiff(buildFields(initial), buildFields(formState)) as ClientFormRuleUpdateFields
    const updated = await updateRule(existing, diff)
    if (updated) {
      closeRuleForm()
    }
  }, [
    closeRuleForm,
    createRule,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateRule,
    validateForm,
  ])

  const handleDelete = useCallback(async () => {
    if (!existing) {
      showMessage({ status: 400, message: 'This rule is no longer available.' })
      return
    }
    const removed = await deleteRule(existing)
    if (removed) {
      closeRuleForm()
    }
  }, [closeRuleForm, deleteRule, existing, showMessage])

  return { handleSave, handleDelete }
}
