import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { createPrintTemplate, updateStatePrintTemplate } from '../api/printTemplate.api'
import { printTemplateNormalization, printTemplateStateNormalization } from '../domain/printTemplate.normalization'
import { useValidationPrintTemplate } from '../domain/printTemplate.validation'
import { removePrintTemplate, upsertPrintTemplate } from '../store'
import type { PrintTemplate } from '../types'

export const usePrintTemplateControllers = () => {
  const validation = useValidationPrintTemplate()
  const { showMessage } = useMessageHandler()

  const createTemplateController = async (payload: PrintTemplate) => {
    const normalized = printTemplateNormalization(payload)
    const isValid = validation.validatePrintTemplate(normalized)
    if (!isValid) {
      showMessage({ status: 400, message: 'Invalid template form.' })
      return false
    }

    upsertPrintTemplate(normalized)

    try {
      const response = await createPrintTemplate(normalized)
      const responseMap = response?.data?.label_templates ?? {}
      const serverPayload = responseMap[normalized.client_id]

      upsertPrintTemplate({
        ...normalized,
        ...(serverPayload ?? {}),
      })
      return true
    } catch (error) {
      removePrintTemplate(normalized.client_id)
      const message = error instanceof ApiError ? error.message : 'Unable to create template.'
      const status = error instanceof ApiError ? error.status : 500
      showMessage({ status, message })
      return false
    }
  }

  const updateTemplateController = async (base: PrintTemplate, payload: PrintTemplate) => {
    const normalized = printTemplateNormalization(payload)
    const isValid = validation.validatePrintTemplate(normalized)
    if (!isValid) {
      showMessage({ status: 400, message: 'Invalid template form.' })
      return false
    }

    if (typeof base.id !== 'number') {
      showMessage({ status: 400, message: 'Template cannot be updated before creation.' })
      return false
    }

    upsertPrintTemplate(normalized)

    try {
      const fieldsToUpdate = printTemplateStateNormalization(normalized)
      await updateStatePrintTemplate(base.id, fieldsToUpdate)
      return true
    } catch (error) {
      upsertPrintTemplate(base)
      const message = error instanceof ApiError ? error.message : 'Unable to update template.'
      const status = error instanceof ApiError ? error.status : 500
      showMessage({ status, message })
      return false
    }
  }

  return {
    createTemplateController,
    updateTemplateController,
  }
}
