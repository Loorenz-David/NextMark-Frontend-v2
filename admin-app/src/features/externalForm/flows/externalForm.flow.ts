import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'

export const EXTERNAL_FORM_STEPS: ExternalFormStep[] = [
  'client_info',
  'contact_info',
  'delivery_address',
]

type CanProceedFn = (step: ExternalFormStep, form: ExternalFormData) => boolean

export const getExternalFormStepIndex = (step: ExternalFormStep) => {
  return EXTERNAL_FORM_STEPS.findIndex((current) => current === step)
}

export const getNextExternalFormStep = (step: ExternalFormStep): ExternalFormStep | null => {
  const currentIndex = getExternalFormStepIndex(step)
  const nextIndex = currentIndex + 1

  if (nextIndex >= EXTERNAL_FORM_STEPS.length) {
    return null
  }

  return EXTERNAL_FORM_STEPS[nextIndex]
}

export const canNavigateToStep = (
  targetStep: ExternalFormStep,
  form: ExternalFormData,
  canProceed: CanProceedFn,
) => {
  const targetIndex = getExternalFormStepIndex(targetStep)

  if (targetIndex <= 0) {
    return true
  }

  return EXTERNAL_FORM_STEPS.slice(0, targetIndex).every((step) => canProceed(step, form))
}
