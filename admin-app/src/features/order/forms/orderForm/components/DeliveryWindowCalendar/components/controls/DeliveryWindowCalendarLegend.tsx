import type { ReactNode } from 'react'

import { DeliveryWindowCalendarModeSelector } from './DeliveryWindowCalendarModeSelector'
import type { DeliveryWindowCalendarMode } from '../../DeliveryWindowCalendar.types'
import type { DeliveryWindowCalendarDensity } from '../../DeliveryWindowCalendarDensity.flow'

type DeliveryWindowCalendarLegendProps = {
  mode: DeliveryWindowCalendarMode
  onChangeMode: (mode: DeliveryWindowCalendarMode) => void
  density?: DeliveryWindowCalendarDensity
}

const LegendItem = ({
  marker,
  label,
  compact,
}: {
  marker: ReactNode
  label: string
  compact: boolean
}) => (
  <div className={`${compact ? 'gap-1 text-[10px]' : 'gap-1.5 text-[11px] md:gap-2 md:text-xs'} flex items-center text-[var(--color-muted)]`}>
    {marker}
    <span>{label}</span>
  </div>
)

export const DeliveryWindowCalendarLegend = ({
  mode,
  onChangeMode,
  density = 'regular',
}: DeliveryWindowCalendarLegendProps) => {
  const isCompact = density === 'compact'

  return (
    <div className={`${isCompact ? 'mt-2.5 pt-2.5' : 'mt-3 pt-3'} border-t border-[var(--color-border-accent)]`}>
      <div className={`${isCompact ? 'gap-1.5' : 'gap-2'} flex flex-wrap items-center justify-between`}>
        <div className={`${isCompact ? 'gap-1.5' : 'gap-2.5 md:gap-4'} flex flex-wrap items-center`}>
          <LegendItem
            marker={<span className={`${isCompact ? 'h-4 w-4 rounded-md' : 'h-5 w-5 rounded-lg md:h-6 md:w-6 md:rounded-xl'} border-2 border-[var(--color-primary)]/80 bg-transparent`} />}
            label="Today"
            compact={isCompact}
          />
          <LegendItem
            marker={<span className={`${isCompact ? 'h-4 w-4 rounded-md' : 'h-5 w-5 rounded-lg md:h-6 md:w-6 md:rounded-xl'} bg-[var(--color-primary)]`} />}
            label="Selected"
            compact={isCompact}
          />
          <LegendItem
            marker={<span className={`${isCompact ? 'h-4 min-w-4 rounded-md px-1 text-[9px]' : 'h-5 min-w-5 rounded-lg px-1.5 text-[10px] md:h-6 md:min-w-6 md:rounded-xl md:px-2 md:text-xs'} flex items-center justify-center bg-[var(--color-primary)]/15 font-semibold text-[var(--color-primary)]`}>2</span>}
            label="Has time windows"
            compact={isCompact}
          />
        </div>

        <DeliveryWindowCalendarModeSelector mode={mode} onChangeMode={onChangeMode} />
      </div>
    </div>
  )
}
