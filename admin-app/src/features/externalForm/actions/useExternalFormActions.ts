import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'
import { createExternalFormController } from '../controllers/externalForm.controller'
import {
  canNavigateToStep,
  getNextExternalFormStep,
} from '../flows/externalForm.flow'
import type { useExternalFormWarnings } from '../setters/useExternalFormWarnings'

export const useExternalFormActions = (
  form: ExternalFormData,
  currentStep: ExternalFormStep,
  setCurrentStep: (step: ExternalFormStep) => void,
  warnings: ReturnType<typeof useExternalFormWarnings>,
  targetUserId: number,
  onSubmitted?: () => void,
) => {
  const controller = createExternalFormController()

  const goToStep = (step: ExternalFormStep) => {
    if (!canNavigateToStep(step, form, controller.canProceed)) {
      return
    }

    setCurrentStep(step)
  }

  const next = () => {
    if (currentStep === 'client_info') {
      const valid =
        warnings.firstNameWarning.validate(form.client_first_name) &&
        warnings.lastNameWarning.validate(form.client_last_name)

      if (!valid) {
        return
      }
    }

    if (currentStep === 'contact_info') {
      const valid = warnings.contactWarning.validate(form)
      if (!valid) {
        return
      }
    }

    if (!controller.canProceed(currentStep, form)) {
      return
    }

    const nextStep = getNextExternalFormStep(currentStep)

    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  const submit = () => {
    const valid = warnings.addressWarning.validate(form)
    if (!valid) {
      return
    }

    if (!controller.canProceed('delivery_address', form)) {
      return
    }

    controller.submit(form, targetUserId)
    onSubmitted?.()
  }

  return {
    goToStep,
    next,
    submit,
  }
}
