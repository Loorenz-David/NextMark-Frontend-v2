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
    <div className="admin-glass-popover w-[320px] rounded-2xl border border-[var(--color-border-accent)] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.28)]">
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
                containerBg: 'rgba(255, 255, 255, 0.04)',
                containerBorder: 'rgba(112, 222, 208, 0.26)',
                selectedBg:
                  'linear-gradient(180deg, rgba(113, 205, 233, 0.22), rgba(84, 146, 209, 0.16))',
                selectedBorder: 'rgba(113, 205, 233, 0.42)',
                selectedTextColor: 'rgb(213, 247, 255)',
                textColor: 'rgba(201, 218, 224, 0.9)',
                textSize: '12px',
                buttonPadding: '7px 10px',
              }}
            />
          </div>
        </div>

        

        <div className="rounded-xl border border-dashed border-white/12 bg-transparent p-3 text-xs text-[var(--color-muted)]/85">
          Additional filters will appear here.
        </div>
      </div>
    </div>
  )
}
