import type {
  ClientFormData,
  ClientFormPorts,
  ClientFormSubmitResult,
} from '@client-form-kit'

import { emitExternalFormSubmit } from '@/realtime/externalForm/externalForm.realtime'

import type { ExternalFormData } from '../domain/externalForm.types'
import { sanitizeExternalFormPhone } from '../domain/externalFormPhone'

/**
 * The kit collects a delivery note the counter does not use, so the wire
 * contract narrows rather than carrying everything: a field that travels all
 * the way to the order form only to be dropped there is a worse place to
 * discover it than here.
 */
const toExternalFormData = (data: ClientFormData): ExternalFormData => ({
  client_first_name: data.client_first_name,
  client_last_name: data.client_last_name,
  client_primary_phone: sanitizeExternalFormPhone(data.client_primary_phone),
  client_secondary_phone: sanitizeExternalFormPhone(data.client_secondary_phone),
  client_email: data.client_email,
  client_address: data.client_address,
  accepted_terms_version_id: data.accepted_terms_version_id,
  marketing_messages: data.marketing_messages,
})

/**
 * Carries the in-store form over the team's external-form room.
 *
 * There is no response to wait for and nothing to reject: the backend routes to
 * the team room and stamps `submitted_by` from the authenticated socket, so the
 * only failure this can see is the emit itself throwing. `refreshConfig` is
 * omitted — the device reads the team's configuration once when a form is
 * requested, and no submission of its own can invalidate it.
 */
export const createLinkedDeviceClientFormPorts = (): ClientFormPorts => ({
  submit: async (data): Promise<ClientFormSubmitResult> => {
    try {
      emitExternalFormSubmit({ form_data: toExternalFormData(data) })
      return { status: 'submitted' }
    } catch {
      return {
        status: 'rejected',
        message: 'Could not reach the till. Please try again.',
      }
    }
  },
})
