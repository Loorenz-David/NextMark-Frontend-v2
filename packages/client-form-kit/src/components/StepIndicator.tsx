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
                'flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] font-semibold transition-colors',
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                  : isDone
                    ? 'cursor-pointer border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10'
                    : 'cursor-default border-[var(--rule-strong)] bg-transparent text-[var(--ink-faint)]',
              ].join(' ')}
            >
              {isDone ? '✓' : idx + 1}
            </button>
            <span
              className={[
                'hidden text-[0.68rem] font-semibold uppercase tracking-[0.16em] sm:block transition-colors',
                isActive
                  ? 'text-[var(--ink)]'
                  : isDone
                    ? 'cursor-pointer text-[var(--accent)] hover:text-[var(--accent-soft)]'
                    : 'text-[var(--ink-faint)]',
              ].join(' ')}
              onClick={() => isClickable && goToStep(step.id)}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'h-px w-8 transition-colors',
                  isDone ? 'bg-[var(--accent)]' : 'bg-[var(--rule-strong)]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
