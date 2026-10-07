import { PLAN_TYPES, PLAN_TYPE_LABELS, planIconTypeMap, type RoutePlanObjective } from '@/features/plan'

type MessagePlanTypeSelectorProps = {
  value: RoutePlanObjective
  onChange: (planType: RoutePlanObjective) => void
}

/**
 * Second step after the channel: which planning domain the templates below
 * belong to. Rendered as one quiet pill group so it reads as a refinement of
 * the channel choice rather than a separate page.
 */
export const MessagePlanTypeSelector = ({ value, onChange }: MessagePlanTypeSelectorProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
      Plan type
    </span>
    <div
      role="group"
      aria-label="Plan type"
      className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-raised p-1"
    >
      {PLAN_TYPES.map((planType) => {
        const Icon = planIconTypeMap[planType]
        const isActive = planType === value
        return (
          <button
            key={planType}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(planType)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[rgb(var(--color-light-blue-r),0.14)] text-[rgb(var(--color-light-blue-r))]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{PLAN_TYPE_LABELS[planType]}</span>
          </button>
        )
      })}
    </div>
  </div>
)
