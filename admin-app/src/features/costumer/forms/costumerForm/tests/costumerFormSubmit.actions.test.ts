import type { RefObject } from 'react'

import type { Costumer } from '@/features/costumer'

import {
  buildCostumerCreateFields,
  buildCostumerUpdateFields,
  executeCostumerFormSubmit,
  resolveCostumerFormPopupKey,
  shouldCloseCostumerFormOnSuccess,
} from '../controllers/useCostumerFormSubmit.controller'
import type { CostumerFormState } from '../state/CostumerForm.types'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const makeFormState = (): CostumerFormState => ({
  first_name: 'Martha',
  last_name: 'Jensen',
  email: 'martha@demo.com',
  addresses: [
    { client_id: 'addr-1', label: 'default', address: null, is_default: true },
    { client_id: 'addr-2', label: 'other', address: null, is_default: false },
  ],
  phones: [
    { client_id: 'phone-1', label: 'default', phone: { prefix: '+1', number: '999111222' }, is_default_primary: true },
    { client_id: 'phone-2', label: 'secondary', phone: { prefix: '+1', number: '111222333' }, is_default_secondary: true },
  ],
  operating_hours: [
    { client_id: 'hours-0', weekday: 0, open_time: '09:00', close_time: '17:00', is_closed: false },
    { client_id: 'hours-5', weekday: 5, is_closed: true, open_time: null, close_time: null },
  ],
})

export const runCostumerFormSubmitActionsTests = async () => {
  const createState = makeFormState()
  const createSnapshot: RefObject<CostumerFormState | null> = {
    current: {
      ...createState,
      first_name: 'Another',
    },
  }

  let createPayload: unknown = null
  const createResult = await executeCostumerFormSubmit(
    {
      createCostumer: async (payload) => {
        createPayload = payload
        return [{ costumer: { client_id: 'new-1', first_name: 'Martha', last_name: 'Jensen' } as Costumer }]
      },
      updateCostumer: async () => null,
    },
    {
      mode: 'create',
      costumer: null,
      formState: createState,
      validateForm: () => true,
      initialFormRef: createSnapshot,
    },
  )

  assert(createResult.status === 'success_create', 'create mode should return success_create on successful create')
  if (createResult.status === 'success_create') {
    assert(createResult.costumer.client_id === 'new-1', 'create mode should return the saved costumer')
  }
  assert(Boolean(createPayload), 'create mode should call createCostumer')

  const createFields = buildCostumerCreateFields(createState)
  assert(createFields.addresses?.length === 0, 'create payload should omit empty placeholder addresses')
  assert(createFields.phones?.length === 2, 'create payload should include full phones array')
  assert(createFields.operating_hours?.length === 2, 'create payload should include selected operating hours')
  assert(
    !createFields.operating_hours?.some((entry) => 'client_id' in entry),
    'create payload operating_hours should not require client_id',
  )

  const editState = makeFormState()
  const editSnapshot: RefObject<CostumerFormState | null> = {
    current: {
      ...editState,
      last_name: 'Other',
    },
  }

  let updatePayload: unknown = null
  const editResult = await executeCostumerFormSubmit(
    {
      createCostumer: async () => null,
      updateCostumer: async (payload) => {
        updatePayload = payload
        return [{ costumer: { id: 7, client_id: 'costumer-7', first_name: 'Martha', last_name: 'Jensen' } as Costumer }]
      },
    },
    {
      mode: 'edit',
      costumer: { id: 7, client_id: 'costumer-7', first_name: 'Martha', last_name: 'Jensen' },
      formState: editState,
      validateForm: () => true,
      initialFormRef: editSnapshot,
    },
  )

  assert(editResult.status === 'success_edit', 'edit mode should return success_edit on successful update')
  if (editResult.status === 'success_edit') {
    assert(editResult.costumer.id === 7, 'edit mode should return the saved costumer')
  }
  assert(Boolean(updatePayload), 'edit mode should call updateCostumer')

  const updateFields = buildCostumerUpdateFields({
    formState: editState,
    initialForm: editSnapshot.current as CostumerFormState,
  })
  assert(
    updateFields.replace_operating_hours === true,
    'edit payload should include replace_operating_hours when operating hours changed',
  )
  assert(
    Array.isArray(updateFields.operating_hours),
    'edit payload should include operating_hours when changed',
  )

  const noChangeState = makeFormState()
  const noChangeSnapshot: RefObject<CostumerFormState | null> = { current: { ...noChangeState } }
  let noChangeCallCount = 0
  const noChangeResult = await executeCostumerFormSubmit(
    {
      createCostumer: async () => {
        noChangeCallCount += 1
        return null
      },
      updateCostumer: async () => {
        noChangeCallCount += 1
        return null
      },
    },
    {
      mode: 'create',
      costumer: null,
      formState: noChangeState,
      validateForm: () => true,
      initialFormRef: noChangeSnapshot,
    },
  )

  assert(noChangeResult.status === 'no_changes', 'equal snapshot should return no_changes')
  assert(noChangeCallCount === 0, 'no_changes should not call create/update API')

  const missingIdResult = await executeCostumerFormSubmit(
    {
      createCostumer: async () => null,
      updateCostumer: async () => null,
    },
    {
      mode: 'edit',
      costumer: { client_id: 'missing-id', first_name: 'Martha', last_name: 'Jensen' },
      formState: editState,
      validateForm: () => true,
      initialFormRef: editSnapshot,
    },
  )

  assert(
    missingIdResult.status === 'dependency_error',
    'edit mode without id should return dependency_error',
  )

  assert(shouldCloseCostumerFormOnSuccess() === true, 'default submit behavior should close popup')
  assert(
    shouldCloseCostumerFormOnSuccess({ closeOnSuccess: false }) === false,
    'closeOnSuccess=false should keep popup open',
  )
  assert(
    resolveCostumerFormPopupKey() === 'costumer.form',
    'default popup key should be costumer.form',
  )
  assert(
    resolveCostumerFormPopupKey({ popupKeyToClose: 'custom.popup' }) === 'custom.popup',
    'custom popup key should override default',
  )

  {
    const initialState = makeFormState()
    const clearedState: CostumerFormState = {
      ...initialState,
      addresses: [{ ...initialState.addresses[0], id: 11, address: null }],
      phones: [
        { ...initialState.phones[0], id: 21, phone: { prefix: '+1', number: '' } },
        { ...initialState.phones[1], id: 22, phone: { prefix: '+1', number: '' } },
      ],
    }

    const fields = buildCostumerUpdateFields({
      formState: clearedState,
      initialForm: {
        ...initialState,
        addresses: [{ ...initialState.addresses[0], id: 11, address: { street_address: 'Main', city: 'A', country: 'SE', postal_code: '11111', coordinates: { lat: 1, lng: 1 } } }],
        phones: [
          { ...initialState.phones[0], id: 21 },
          { ...initialState.phones[1], id: 22 },
        ],
      },
    })

    assert(
      fields.delete_address_ids?.includes(11) ?? false,
      'clearing persisted address should emit delete_address_ids',
    )
    assert(
      fields.delete_phone_ids?.includes(21) ?? false,
      'clearing persisted primary phone should emit delete_phone_ids',
    )
    assert(
      fields.delete_phone_ids?.includes(22) ?? false,
      'clearing persisted secondary phone should emit delete_phone_ids',
    )
  }
}
