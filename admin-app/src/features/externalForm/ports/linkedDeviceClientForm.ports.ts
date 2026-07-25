import type {
  ClientFormPorts,
  ClientFormSubmitResult,
} from '@client-form-kit'

import { emitExternalFormSubmit } from '@/realtime/externalForm/externalForm.realtime'

import { toExternalFormData } from '../domain/externalForm.map'

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
