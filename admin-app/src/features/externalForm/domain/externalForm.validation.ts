import { hasExternalFormPhoneNumber } from "./externalFormPhone";
import type { ExternalFormData } from './externalForm.types'

export const validateClientInfo = (data: ExternalFormData) => {
  return Boolean(data.client_first_name && data.client_last_name)
}

export const validateContactInfo = (data: ExternalFormData) => {
  return Boolean(hasExternalFormPhoneNumber(data.client_primary_phone) && data.client_email)
}

export const validateDeliveryAddress = (data: ExternalFormData) => {
  return Boolean(data.client_address)
}
