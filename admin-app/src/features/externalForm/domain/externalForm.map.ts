import type { ClientFormData } from '@client-form-kit'

import type { ExternalFormData } from './externalForm.types'
import { sanitizeExternalFormPhone } from './externalFormPhone'

/**
 * The kit collects a delivery note the counter does not use, so the wire
 * contract narrows rather than carrying everything: a field that travels all
 * the way to the order form only to be dropped there is a worse place to
 * discover it than here. Shared by the submit port and the live-progress
 * emitter so both paths send the same shape.
 */
export const toExternalFormData = (data: ClientFormData): ExternalFormData => ({
  client_first_name: data.client_first_name,
  client_last_name: data.client_last_name,
  client_primary_phone: sanitizeExternalFormPhone(data.client_primary_phone),
  client_secondary_phone: sanitizeExternalFormPhone(data.client_secondary_phone),
  client_email: data.client_email,
  client_address: data.client_address,
  accepted_terms_version_id: data.accepted_terms_version_id,
  marketing_messages: data.marketing_messages,
})
