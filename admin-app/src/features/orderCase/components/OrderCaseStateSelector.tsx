import { CaseRegistry } from '../domain/orderCase.model'
import type { OrderCaseState } from '../types'

type OrderCaseStateSelectorProps = {
  value: OrderCaseState
  onSelect: (state: OrderCaseState) => void
}


export const OrderCaseStateSelector = ({ value, onSelect }: OrderCaseStateSelectorProps) => {
  return (
    <div className="inline-flex w-full rounded-[1.35rem] border border-white/12 bg-white/[0.035] p-1.5 backdrop-blur-xl">
      {Object.values(CaseRegistry).map((state) => {
        const isActive = state === value
        const activeClasses =
          state === 'Open'
            ? 'border-[rgba(96,141,232,0.38)] bg-[linear-gradient(135deg,rgba(96,141,232,0.22),rgba(96,141,232,0.08))] text-[rgb(208,223,255)]'
            : state === 'Resolving'
              ? 'border-[rgba(255,205,93,0.34)] bg-[linear-gradient(135deg,rgba(255,205,93,0.18),rgba(255,205,93,0.06))] text-[rgb(255,236,173)]'
              : 'border-[rgba(104,214,195,0.34)] bg-[linear-gradient(135deg,rgba(104,214,195,0.18),rgba(104,214,195,0.06))] text-[rgb(212,255,247)]'

        return (
          <button
            key={state}
            type="button"
            onClick={() => onSelect(state)}
            className={`flex-1 rounded-[1rem] border px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? activeClasses
                : 'border-transparent text-[var(--color-muted)] hover:bg-white/[0.06]'
            }`}
          >
            {state}
          </button>
        )
      })}
    </div>
  )
}
