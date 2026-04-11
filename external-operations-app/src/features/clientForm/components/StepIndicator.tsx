import { useClientForm } from '../context/useClientForm'
import type { ClientFormStep } from '../domain/clientForm.types'

const STEPS: { id: ClientFormStep; label: string }[] = [
  { id: 'client_info', label: 'Client Info' },
  { id: 'contact_info', label: 'Contact' },
  { id: 'delivery_address', label: 'Address' },
]

export const StepIndicator = () => {
  const { currentStep, goToStep } = useClientForm()
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isActive = step.id === currentStep
        const isClickable = isDone

        return (
          <div key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && goToStep(step.id)}
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                isActive
                  ? 'bg-[#83ccb9] text-[#0f2220] shadow-[0_0_14px_rgba(131,204,185,0.5)]'
                  : isDone
                    ? 'cursor-pointer border border-[#83ccb9]/40 bg-[#83ccb9]/18 text-[#83ccb9] hover:bg-[#83ccb9]/28'
                    : 'cursor-default border border-white/12 bg-white/6 text-white/36',
              ].join(' ')}
            >
              {isDone ? '✓' : idx + 1}
            </button>
            <span
              className={[
                'hidden text-sm sm:block transition-colors',
                isActive
                  ? 'font-medium text-white/90'
                  : isDone
                    ? 'cursor-pointer text-[#83ccb9]/70 hover:text-[#83ccb9]'
                    : 'text-white/28',
              ].join(' ')}
              onClick={() => isClickable && goToStep(step.id)}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'h-px w-8 transition-colors',
                  isDone ? 'bg-[#83ccb9]/40' : 'bg-white/10',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
