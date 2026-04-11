import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'
import type { RefObject } from 'react'
import { useCallback } from 'react'

import { hasFormChanges } from '@shared-domain'
import { useMessageHandler } from '@shared-message-handler'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import { useCostumerController } from '../../../controllers/costumerMutations.controller'
import type {
  Costumer,
  CostumerAddress,
  CostumerCreateFields,
  CostumerPhone,
  CostumerUpdateFields,
  CostumerUpdateTargetPayload,
} from '../../../dto/costumer.dto'
import {
  hasOperatingHoursChanged,
  mapOperatingHoursForCreatePayload,
  mapOperatingHoursForUpdatePayload,
  normalizeOperatingHoursForForm,
} from '../flows/costumerOperatingHours.flow'
import type {
  CostumerFormMode,
  CostumerFormState,
  CostumerFormSubmitOptions,
} from '../state/CostumerForm.types'

type CostumerFormSubmitDeps = {
  createCostumer: ReturnType<typeof useCostumerController>['createCostumer']
  updateCostumer: ReturnType<typeof useCostumerController>['updateCostumer']
}

type CostumerFormSubmitCommand = {
  mode: CostumerFormMode
  costumer: Costumer | null
  formState: CostumerFormState
  validateForm: () => boolean
  initialFormRef: RefObject<CostumerFormState | null>
}

export type CostumerFormSubmitResult =
  | { status: 'success_create'; costumer: Costumer }
  | { status: 'success_edit'; costumer: Costumer }
  | { status: 'validation_error'; message: string }
  | { status: 'no_changes'; message: string }
  | { status: 'dependency_error'; message: string }
  | { status: 'error'; message: string }

const DEFAULT_POPUP_KEY = 'costumer.form'

export const shouldCloseCostumerFormOnSuccess = (submitOptions?: CostumerFormSubmitOptions) =>
  submitOptions?.closeOnSuccess !== false

export const resolveCostumerFormPopupKey = (submitOptions?: CostumerFormSubmitOptions) =>
  submitOptions?.popupKeyToClose ?? DEFAULT_POPUP_KEY

const extractFirstCostumer = (
  bundles:
    | Array<{
        costumer: Costumer
      }>
    | null,
) => bundles?.find((bundle) => Boolean(bundle?.costumer))?.costumer ?? null

const trimToNullable = (value: string | null | undefined) => {
  const normalized = (value ?? '').trim()
  return normalized.length > 0 ? normalized : null
}

const hasAddressValue = (entry?: CostumerAddress | null) => Boolean(entry?.address)

const hasPhoneValue = (entry?: CostumerPhone | null) => {
  const number = entry?.phone?.number?.trim() ?? ''
  return number.length > 0
}

const normalizePhonePayload = (entry: CostumerPhone) => ({
  prefix: entry.phone?.prefix?.trim() || DEFAULT_PREFIX,
  number: entry.phone?.number?.trim() ?? '',
})

const buildCreateAddresses = (formState: CostumerFormState) => {
  const address = formState.addresses[0]
  if (!hasAddressValue(address)) {
    return []
  }

  return [
    {
      client_id: address.client_id,
      label: address.label ?? 'default',
      address: address.address,
      is_default: true,
    },
  ]
}

const buildCreatePhones = (formState: CostumerFormState) => {
  const primary = formState.phones[0]
  const secondary = formState.phones[1]
  const payload: NonNullable<CostumerCreateFields['phones']> = []

  if (primary && hasPhoneValue(primary)) {
    payload.push({
      client_id: primary.client_id,
      label: primary.label ?? 'default',
      phone: normalizePhonePayload(primary),
      is_default_primary: true,
    })
  }

  if (secondary && hasPhoneValue(secondary)) {
    payload.push({
      client_id: secondary.client_id,
      label: secondary.label ?? 'secondary',
      phone: normalizePhonePayload(secondary),
      is_default_secondary: true,
    })
  }

  return payload
}

export const buildCostumerCreateFields = (formState: CostumerFormState): CostumerCreateFields => {
  const trimmedEmail = formState.email.trim()
  const addresses = buildCreateAddresses(formState)
  const phones = buildCreatePhones(formState)
  const operatingHours = mapOperatingHoursForCreatePayload(
    normalizeOperatingHoursForForm(formState.operating_hours),
  )

  const fields: CostumerCreateFields = {
    first_name: formState.first_name.trim(),
    last_name: formState.last_name.trim(),
    email: trimmedEmail.length > 0 ? trimmedEmail : null,
  }
  if (addresses.length > 0) {
    fields.addresses = addresses
  }
  if (phones.length > 0) {
    fields.phones = phones
  }
  if (operatingHours.length > 0) {
    fields.operating_hours = operatingHours
  }

  return fields
}

type PhoneRole = 'primary' | 'secondary'

const buildPhoneUpdateRow = ({
  role,
  current,
  initial,
}: {
  role: PhoneRole
  current?: CostumerPhone | null
  initial?: CostumerPhone | null
}) => {
  const currentHasValue = hasPhoneValue(current)
  const initialHasValue = hasPhoneValue(initial)
  const initialId = typeof initial?.id === 'number' ? initial.id : undefined

  if (!currentHasValue) {
    return {
      row: null,
      deleteId: initialHasValue && initialId ? initialId : null,
    }
  }

  if (!current) {
    return { row: null, deleteId: null }
  }

  const row: NonNullable<CostumerUpdateFields['phones']>[number] = {
    client_id: current.client_id || initial?.client_id,
    label: current.label ?? (role === 'primary' ? 'default' : 'secondary'),
    phone: normalizePhonePayload(current),
    ...(role === 'primary'
      ? { is_default_primary: true }
      : { is_default_secondary: true }),
  }

  if (initialId) {
    row.id = initialId
  }

  return {
    row,
    deleteId: null,
  }
}

export const buildCostumerUpdateFields = ({
  formState,
  initialForm,
}: {
  formState: CostumerFormState
  initialForm: CostumerFormState
}): CostumerUpdateFields => {
  const fields: CostumerUpdateFields = {
    first_name: formState.first_name.trim(),
    last_name: formState.last_name.trim(),
    email: trimToNullable(formState.email),
  }

  const currentAddress = formState.addresses[0]
  const initialAddress = initialForm.addresses[0]
  const currentHasAddress = hasAddressValue(currentAddress)
  const initialHasAddress = hasAddressValue(initialAddress)
  const initialAddressId = typeof initialAddress?.id === 'number' ? initialAddress.id : undefined

  if (currentHasAddress && currentAddress) {
    fields.addresses = [
      {
        ...(initialAddressId ? { id: initialAddressId } : {}),
        client_id: currentAddress.client_id || initialAddress?.client_id,
        label: currentAddress.label ?? 'default',
        address: currentAddress.address,
        is_default: true,
      },
    ]
  } else if (initialHasAddress && initialAddressId) {
    fields.delete_address_ids = [initialAddressId]
  }

  const primaryOutcome = buildPhoneUpdateRow({
    role: 'primary',
    current: formState.phones[0],
    initial: initialForm.phones[0],
  })
  const secondaryOutcome = buildPhoneUpdateRow({
    role: 'secondary',
    current: formState.phones[1],
    initial: initialForm.phones[1],
  })

  const phoneRows = [primaryOutcome.row, secondaryOutcome.row].filter(
    (entry): entry is NonNullable<CostumerUpdateFields['phones']>[number] => Boolean(entry),
  )
  if (phoneRows.length > 0) {
    fields.phones = phoneRows
  }

  const deletePhoneIds = [primaryOutcome.deleteId, secondaryOutcome.deleteId].filter(
    (entry): entry is number => typeof entry === 'number',
  )
  if (deletePhoneIds.length > 0) {
    fields.delete_phone_ids = Array.from(new Set(deletePhoneIds))
  }

  const normalizedCurrentHours = normalizeOperatingHoursForForm(formState.operating_hours)
  const normalizedInitialHours = normalizeOperatingHoursForForm(initialForm.operating_hours)
  if (
    hasOperatingHoursChanged({
      current: normalizedCurrentHours,
      initial: normalizedInitialHours,
    })
  ) {
    fields.replace_operating_hours = true
    fields.operating_hours = mapOperatingHoursForUpdatePayload(normalizedCurrentHours)
  }

  return fields
}

export const executeCostumerFormSubmit = async (
  deps: CostumerFormSubmitDeps,
  command: CostumerFormSubmitCommand,
): Promise<CostumerFormSubmitResult> => {
  const { mode, costumer, formState, validateForm, initialFormRef } = command

  if (!validateForm()) {
    return { status: 'validation_error', message: 'Please fix the highlighted fields.' }
  }

  if (!initialFormRef.current) {
    return { status: 'dependency_error', message: 'Missing initial form snapshot.' }
  }

  if (!hasFormChanges(formState, initialFormRef)) {
    return { status: 'no_changes', message: 'No changes to save.' }
  }

  const initialForm = initialFormRef.current

  if (mode === 'create') {
    const fields = buildCostumerCreateFields(formState)
    const created = await deps.createCostumer(fields)
    if (!created) {
      return { status: 'error', message: 'Unable to create costumer.' }
    }

    const createdCostumer = extractFirstCostumer(created)
    if (!createdCostumer) {
      return { status: 'error', message: 'Create response is missing costumer.' }
    }

    return { status: 'success_create', costumer: createdCostumer }
  }

  if (!costumer?.id) {
    return { status: 'dependency_error', message: 'Costumer id is required for editing.' }
  }

  const fields = buildCostumerUpdateFields({
    formState,
    initialForm,
  })

  const updatePayload: CostumerUpdateTargetPayload = {
    target_id: costumer.id,
    fields,
  }

  const updated = await deps.updateCostumer(updatePayload)
  if (!updated) {
    return { status: 'error', message: 'Unable to update costumer.' }
  }

  const updatedCostumer = extractFirstCostumer(updated)
  if (!updatedCostumer) {
    return { status: 'error', message: 'Update response is missing costumer.' }
  }

  return { status: 'success_edit', costumer: updatedCostumer }
}

const closeCostumerForm = ({
  popupManager,
  popupKey,
}: {
  popupManager: ReturnType<typeof usePopupManager>
  popupKey: string
}) => {
  popupManager.closeByKey(popupKey)
}

export const useCostumerFormActions = ({
  mode,
  costumer,
  formState,
  validateForm,
  initialFormRef,
  submitOptions,
}: {
  mode: CostumerFormMode
  costumer: Costumer | null
  formState: CostumerFormState
  validateForm: () => boolean
  initialFormRef: RefObject<CostumerFormState | null>
  submitOptions?: CostumerFormSubmitOptions
}) => {
  const { createCostumer, updateCostumer } = useCostumerController()
  const { showMessage } = useMessageHandler()
  const popupManager = usePopupManager()

  const handleSave = useCallback(async () => {
    const result = await executeCostumerFormSubmit(
      {
        createCostumer,
        updateCostumer,
      },
      {
        mode,
        costumer,
        formState,
        validateForm,
        initialFormRef,
      },
    )

    if (result.status === 'success_create') {
      showMessage({ status: 200, message: 'Costumer successfully created.' })
      submitOptions?.onSavedCostumer?.(result.costumer)

      if (shouldCloseCostumerFormOnSuccess(submitOptions)) {
        closeCostumerForm({
          popupManager,
          popupKey: resolveCostumerFormPopupKey(submitOptions),
        })
      }
      return
    }

    if (result.status === 'success_edit') {
      showMessage({ status: 200, message: 'Costumer successfully updated.' })
      submitOptions?.onSavedCostumer?.(result.costumer)

      if (shouldCloseCostumerFormOnSuccess(submitOptions)) {
        closeCostumerForm({
          popupManager,
          popupKey: resolveCostumerFormPopupKey(submitOptions),
        })
      }
      return
    }

    if (result.status === 'validation_error' || result.status === 'no_changes' || result.status === 'dependency_error') {
      showMessage({ status: 400, message: result.message })
      return
    }

    showMessage({ status: 500, message: result.message })
  }, [
    costumer,
    createCostumer,
    formState,
    initialFormRef,
    mode,
    popupManager,
    showMessage,
    submitOptions,
    updateCostumer,
    validateForm,
  ])

  return {
    handleSave,
  }
}
