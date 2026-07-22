import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'
import { sanitizeExternalFormPhone } from "../domain/externalFormPhone";
import {
  validateClientInfo,
  validateContactInfo,
  validateDeliveryAddress,
} from '../domain/externalForm.validation'
import { emitExternalFormSubmit } from '@/realtime/externalForm/externalForm.realtime'

export const createExternalFormController = () => {
  const canProceed = (step: ExternalFormStep, form: ExternalFormData): boolean => {
    switch (step) {
      case 'client_info':
        return validateClientInfo(form)
      case 'contact_info':
        return validateContactInfo(form)
      case 'delivery_address':
        return validateDeliveryAddress(form)
      default:
        return false
    }
  }

  const submit = (form: ExternalFormData) => {
    const sanitizedForm: ExternalFormData = {
      ...form,
      client_primary_phone: sanitizeExternalFormPhone(form.client_primary_phone),
      client_secondary_phone: sanitizeExternalFormPhone(form.client_secondary_phone),
    }

    // Team-scoped: the backend routes to the team's external-form room and stamps
    // submitted_by from the authenticated socket, so no target user id is sent.
    emitExternalFormSubmit({ form_data: sanitizedForm })
  }

  return {
    canProceed,
    submit,
  }
}
