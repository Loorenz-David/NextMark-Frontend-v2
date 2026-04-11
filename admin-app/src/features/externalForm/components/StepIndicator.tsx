import { createExternalFormController } from '../controllers/externalForm.controller'
import type { ExternalFormStep } from '../domain/externalForm.types'
import { EXTERNAL_FORM_STEPS } from '../flows/externalForm.flow'
import { useExternalForm } from '../context'

const stepLabels: Record<ExternalFormStep, string> = {
  client_info: 'Client',
  contact_info: 'Contact',
  delivery_address: 'Address',
}

export const StepIndicator = () => {
  const { currentStep, form, goToStep } = useExternalForm()
  const controller = createExternalFormController()

  const currentIndex = EXTERNAL_FORM_STEPS.findIndex((step) => step === currentStep)

  return (
    <nav className="w-full" aria-label="External form steps">
      <ol className="flex items-center justify-center gap-2">
        {EXTERNAL_FORM_STEPS.map((step, index) => {
          const isCurrent = step === currentStep
          const isCompleted = index < currentIndex && controller.canProceed(step, form)
          const isClickable = isCompleted

          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) goToStep(step)
                }}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-[#83ccb9] text-[#0f2220] shadow-[0_0_14px_rgba(131,204,185,0.5)]'
                      : isCompleted
                        ? 'cursor-pointer border border-[#83ccb9]/40 bg-[#83ccb9]/18 text-[#83ccb9] hover:bg-[#83ccb9]/28'
                        : 'cursor-default border border-white/12 bg-white/[0.06] text-white/36'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span
                  className={`hidden text-sm transition-colors sm:block ${
                    isCurrent
                      ? 'font-medium text-white/90'
                      : isCompleted
                        ? 'cursor-pointer text-[#83ccb9]/70 hover:text-[#83ccb9]'
                        : 'text-white/28'
                  }`}
                  onClick={() => {
                    if (isClickable) goToStep(step)
                  }}
                >
                  {stepLabels[step]}
                </span>
              </button>
              {index < EXTERNAL_FORM_STEPS.length - 1 && (
                <div
                  className={`h-px w-8 transition-colors ${
                    isCompleted ? 'bg-[#83ccb9]/40' : 'bg-white/10'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
