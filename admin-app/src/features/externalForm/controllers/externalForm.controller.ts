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

  const submit = (form: ExternalFormData, targetUserId: number) => {
    if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
      return
    }

    const sanitizedForm: ExternalFormData = {
      ...form,
      client_primary_phone: sanitizeExternalFormPhone(form.client_primary_phone),
      client_secondary_phone: sanitizeExternalFormPhone(form.client_secondary_phone),
    }

    console.log('External Form Submitted:', sanitizedForm)
    emitExternalFormSubmit({
      user_id: targetUserId,
      form_data: sanitizedForm,
    })
  }

  return {
    canProceed,
    submit,
  }
}
