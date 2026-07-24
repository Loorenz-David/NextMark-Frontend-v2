import { CaseRegistry } from '../domain/orderCase.model'
import type { OrderCaseState } from '../types'

type OrderCaseStateSelectorProps = {
  value: OrderCaseState
  onSelect: (state: OrderCaseState) => void
}


export const OrderCaseStateSelector = ({ value, onSelect }: OrderCaseStateSelectorProps) => {
  return (
    <div className="inline-flex w-full rounded-3xl border border-border bg-surface-subtle p-1.5 backdrop-blur-xl">
      {Object.values(CaseRegistry).map((state) => {
        const isActive = state === value
        const activeClasses =
          state === 'Open'
            ? 'border-[color-mix(in_srgb,var(--color-dark-blue)_38%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-dark-blue)_22%,transparent),color-mix(in_srgb,var(--color-dark-blue)_8%,transparent))] text-[rgb(208,223,255)]'
            : state === 'Resolving'
              ? 'border-[rgba(var(--warning-state-r),0.34)] bg-[linear-gradient(135deg,rgba(var(--warning-state-r),0.18),rgba(var(--warning-state-r),0.06))] text-[rgb(var(--warning-copy-r))]'
              : 'border-[rgba(var(--color-turques-r),0.34)] bg-[linear-gradient(135deg,rgba(var(--color-turques-r),0.18),rgba(var(--color-turques-r),0.06))] text-[rgb(212,255,247)]'

        return (
          <button
            key={state}
            type="button"
            onClick={() => onSelect(state)}
            className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? activeClasses
                : 'border-transparent text-[var(--color-muted)] hover:bg-surface-hover'
            }`}
          >
            {state}
          </button>
        )
      })}
    </div>
  )
}
