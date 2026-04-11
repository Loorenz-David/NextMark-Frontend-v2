import type { ClientFormData, ClientFormStep } from './clientForm.types'

export type ClientFormFieldErrors = Partial<Record<keyof ClientFormData, string>>

export function validateStep(step: ClientFormStep, data: ClientFormData): ClientFormFieldErrors {
  const errors: ClientFormFieldErrors = {}

  if (step === 'client_info') {
    if (!data.client_first_name.trim()) errors.client_first_name = 'First name is required'
    if (!data.client_last_name.trim()) errors.client_last_name = 'Last name is required'
  }

  if (step === 'contact_info') {
    if (!data.client_email.trim()) errors.client_email = 'Email is required'
    if (!data.client_primary_phone?.number?.trim()) errors.client_primary_phone = 'Phone number is required'
  }

  if (step === 'delivery_address') {
    if (!data.client_address) {
      errors.client_address = 'Delivery address is required'
    }
  }

  return errors
}

export function isStepValid(step: ClientFormStep, data: ClientFormData): boolean {
  return Object.keys(validateStep(step, data)).length === 0
}
