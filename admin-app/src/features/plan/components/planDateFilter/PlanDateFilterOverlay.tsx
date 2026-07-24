import SegmentedSelect from '@/shared/inputs/SegmentedSelect'

import { PLAN_DATE_FILTER_MODES } from './domain/planDateFilter.constants'
import type { PlanDateFilterMode } from './domain/planDateFilter.types'

type PlanDateFilterOverlayProps = {
  mode: PlanDateFilterMode
  onModeChange: (mode: PlanDateFilterMode) => void

}

export const PlanDateFilterOverlay = ({
  mode,
  onModeChange,

}: PlanDateFilterOverlayProps) => {
  return (
    <div className="admin-glass-popover w-[320px] rounded-2xl border border-[var(--color-border-accent)] p-4 shadow-[var(--shadow-panel-filter)]">
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]/80">
            Time mode
          </p>
          <div className="mt-2">
            <SegmentedSelect
              options={PLAN_DATE_FILTER_MODES}
              selectedValue={mode}
              onSelect={(value) => onModeChange(value as PlanDateFilterMode)}
              styleConfig={{
                containerBg: 'var(--paper-raised)',
                containerBorder: 'rgba(var(--accent-r),0.26)',
                selectedBg:
                  'linear-gradient(180deg, rgba(var(--info-r),0.22), rgba(var(--info-r),0.16))',
                selectedBorder: 'rgba(var(--info-r),0.42)',
                selectedTextColor: 'var(--info-ink)',
                textColor: 'rgba(var(--neutral-pale-r),0.9)',
                textSize: '12px',
                buttonPadding: '7px 10px',
              }}
            />
          </div>
        </div>

        

        <div className="rounded-xl border border-dashed border-border bg-transparent p-3 text-xs text-[var(--color-muted)]/85">
          Additional filters will appear here.
        </div>
      </div>
    </div>
  )
}
