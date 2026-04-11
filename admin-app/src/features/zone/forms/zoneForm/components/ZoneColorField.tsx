import { useMemo, useState } from 'react'

import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import {
  ZONE_COLOR_PRESETS,
  isValidZoneHexColor,
  normalizeZoneHexColor,
} from '../../../domain/zoneColor.domain'

type ZoneColorFieldProps = {
  value: string
  onChange: (value: string) => void
  inputContainerClassName: string
}

export const ZoneColorField = ({
  value,
  onChange,
  inputContainerClassName,
}: ZoneColorFieldProps) => {
  const [open, setOpen] = useState(false)
  const normalizedValue = normalizeZoneHexColor(value) ?? '#111111'
  const hasValidHex = useMemo(() => isValidZoneHexColor(value), [value])

  return (
    <FloatingPopover
      open={open}
      onOpenChange={setOpen}
      classes="flex-none"
      offSetNum={8}
      floatingClassName="z-[220]"
      renderInPortal
      reference={(
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`${inputContainerClassName} flex w-full items-center gap-3 px-3 py-2 text-left`}
        >
          <span
            className="h-6 w-6 rounded-full border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            style={{ backgroundColor: normalizedValue }}
          />
          <span className="text-sm font-medium uppercase tracking-[0.08em] text-[var(--color-text)]">
            {hasValidHex ? normalizeZoneHexColor(value) : 'Custom hex'}
          </span>
        </button>
      )}
    >
      <div className="admin-glass-panel-strong w-[260px] rounded-[22px] border border-white/12 p-4 shadow-[0_20px_44px_rgba(4,12,22,0.45)]">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-10 rounded-full border border-white/15"
            style={{ backgroundColor: normalizedValue }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Zone Color
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
              {normalizedValue}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {ZONE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`Select ${preset}`}
              className={`h-9 w-9 rounded-full border transition-transform hover:scale-[1.05] ${
                normalizedValue === preset
                  ? 'border-white/80 ring-2 ring-white/30'
                  : 'border-white/12'
              }`}
              style={{ backgroundColor: preset }}
              onClick={() => {
                onChange(preset)
                setOpen(false)
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Hex
          </label>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="#111111"
            className="h-11 w-full rounded-xl border border-white/12 bg-[var(--color-page)] px-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]/50"
          />
          <p className="text-xs text-[var(--color-muted)]">
            {hasValidHex
              ? 'Stored as hex and used on the map when valid.'
              : 'Enter a valid hex color like #111111.'}
          </p>
        </div>
      </div>
    </FloatingPopover>
  )
}
