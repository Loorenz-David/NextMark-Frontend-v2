import { MarkerAnchorPopover } from './MarkerAnchorPopover'
import { formatIsoToTeamTimeZone } from '@/shared/utils/teamTimeZone'
import type { DriverLocationUpdatedPayload } from '@shared-realtime'

type DriverLocationMarkerPopoverProps = {
  open: boolean
  anchorEl: HTMLElement | null
  position: DriverLocationUpdatedPayload | null
  onOpenChange: (open: boolean) => void
}

const formatRecordedAt = (value?: string | null) => {
  if (!value) return '—'
  const teamValue = formatIsoToTeamTimeZone(value, { forceTeamTimeZone: true })
  return teamValue ? teamValue.replace('T', ' ') : '—'
}

const formatCoordinate = (value?: number | null) => (
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : '—'
)

export const DriverLocationMarkerPopover = ({
  open,
  anchorEl,
  position,
  onOpenChange,
}: DriverLocationMarkerPopoverProps) => {
  if (!position) return null

  return (
    <MarkerAnchorPopover
      open={open}
      anchorEl={anchorEl}
      onOpenChange={onOpenChange}
      className="z-50"
    >
      <div className="min-w-[240px] rounded-2xl border border-[var(--color-muted)]/20 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]/80">
          Driver Location
        </div>
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-[var(--color-muted)]/10 px-3 py-3 text-sm text-[var(--color-text)]">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]/70">Recorded</span>
            <span className="text-right font-medium">{formatRecordedAt(position.timestamp)}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]/70">Lat</span>
            <span className="font-medium">{formatCoordinate(position.coords?.lat)}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--color-muted)]/70">Lng</span>
            <span className="font-medium">{formatCoordinate(position.coords?.lng)}</span>
          </div>
        </div>
      </div>
    </MarkerAnchorPopover>
  )
}
