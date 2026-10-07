import type { ClientFormData, ClientFormStep } from './clientForm.types'
import type { ClientFormConfig } from './clientFormConfig.types'

export type ClientFormFieldErrors = Partial<Record<keyof ClientFormData, string>>

export function validateStep(
  step: ClientFormStep,
  data: ClientFormData,
  config?: ClientFormConfig,
): ClientFormFieldErrors {
  const errors: ClientFormFieldErrors = {}

  if (step === 'client_info') {
    if (!data.client_first_name.trim()) errors.client_first_name = 'Ange ditt förnamn'
    if (!data.client_last_name.trim()) errors.client_last_name = 'Ange ditt efternamn'
  }

  if (step === 'contact_info') {
    if (!data.client_email.trim()) errors.client_email = 'Ange din e-postadress'
    if (!data.client_primary_phone?.number?.trim()) errors.client_primary_phone = 'Ange ditt telefonnummer'
  }

  if (step === 'delivery_address') {
    if (!data.client_address) {
      errors.client_address = 'Ange en leveransadress'
    }

    // The backend rejects the submission outright when acceptance is required,
    // so the form blocks it here rather than burning the single-use token.
    if (
      config?.require_terms_acceptance &&
      data.accepted_terms_version_id !== config.terms?.version_id
    ) {
      errors.accepted_terms_version_id =
        'Du behöver godkänna villkoren för att skicka'
    }
  }

  return errors
}

export function isStepValid(
  step: ClientFormStep,
  data: ClientFormData,
  config?: ClientFormConfig,
): boolean {
  return Object.keys(validateStep(step, data, config)).length === 0
}
