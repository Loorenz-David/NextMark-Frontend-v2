import type { ChangeEvent, Dispatch, SetStateAction } from 'react'

import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'
import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'
import type { OrderDeliveryWindow } from '../../../types/order'
import type { OrderOperationTypes } from '../../../types/order'
import {
  resolveOrderFormTimeZone,
  sortDeliveryWindowsUtc,
} from '../flows/orderFormDeliveryWindows.flow'

import type { OrderFormState, OrderFormWarnings } from './OrderForm.types'

const normalizeOperationType = (value: string | number): OrderOperationTypes => {
  if (value === 'pickup') return 'pickup'
  if (value === 'pickup_dropoff' || value === 'pickup-dropoff') return 'pickup_dropoff'
  return 'dropoff'
}

export const useOrderFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<OrderFormState>>
  warnings: OrderFormWarnings
}) => {
  const timeZone = resolveOrderFormTimeZone()

  const updateFormState = (updater: (prev: OrderFormState) => OrderFormState) => {
    setFormState((prev) => updater(prev))
  }

  const handleOrderPlanObjective = (value: string | null) => {
    updateFormState((prev) => ({ ...prev, order_plan_objective: value }))
  }

  const handleOperationType = (value: string | number) => {
    const normalized = normalizeOperationType(value)
    updateFormState((prev) => ({ ...prev, operation_type: normalized }))
  }

  const handleReference = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, reference_number: value }))
    warnings.referenceWarning.validate(value)
  }

  const handleExternalSource = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, external_source: value }))
  }

  const handleExternalTrackingNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, external_tracking_number: value }))
  }

  const handleExternalTrackingLink = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, external_tracking_link: value }))
  }

  const handleTrackingNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, tracking_number: value }))
  }

  const handleTrackingLink = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, tracking_link: value }))
  }

  const handleFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_first_name: value }))
    warnings.firstNameWarning.validate(value)
  }

  const handleLastName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_last_name: value }))
    warnings.lastNameWarning.validate(value)
  }

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, client_email: value }))
    warnings.emailWarning.validate(value)
  }

  const handlePrimaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_primary_phone: value }))
    warnings.primaryPhoneWarning.validate(value)
  }

  const handleSecondaryPhone = (value: Phone) => {
    updateFormState((prev) => ({ ...prev, client_secondary_phone: value }))
  }

  const handleAddress = (value: address | null) => {
    updateFormState((prev) => ({ ...prev, client_address: value }))
    warnings.addressWarning.validate(value)
  }

  const mergeExternalClientData = (data: ExternalFormData) => {
    updateFormState((prev) => ({
      ...prev,
      client_first_name: data.client_first_name || prev.client_first_name,
      client_last_name: data.client_last_name || prev.client_last_name,
      client_email: data.client_email || prev.client_email,
      client_primary_phone: data.client_primary_phone ?? prev.client_primary_phone,
      client_secondary_phone: data.client_secondary_phone ?? prev.client_secondary_phone,
      client_address: data.client_address ?? prev.client_address,
    }))
  }

  const handleDeliveryWindows = (windows: OrderDeliveryWindow[]) => {
    const sorted = sortDeliveryWindowsUtc(windows)
    updateFormState((prev) => ({ ...prev, delivery_windows: sorted }))
  }

  const handleOrderNote = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateFormState((prev) => ({ ...prev, order_note: value }))
  }

  return {
    handleOrderPlanObjective,
    handleOperationType,
    handleReference,
    handleExternalSource,
    handleExternalTrackingNumber,
    handleExternalTrackingLink,
    handleTrackingNumber,
    handleTrackingLink,
    handleFirstName,
    handleLastName,
    handleEmail,
    handlePrimaryPhone,
    handleSecondaryPhone,
    handleAddress,
    handleDeliveryWindows,
    handleOrderNote,
    mergeExternalClientData,
  }
}
