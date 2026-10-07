import type { CSSProperties } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

import { FOLD_TAB_SURFACE_STYLE } from '../layout/foldTab.styles'

interface MapToggleTabProps {
  isMapVisible: boolean
  splitMode: boolean
  onToggle: () => void
}

// Matches the plan panel header (py-3 + 48px content) so the tab reads as
// part of the same header band when it sits on the plan's edge.
const PLAN_HEADER_HEIGHT = 72

const HIDE_TAB_STYLE: CSSProperties = {
  ...FOLD_TAB_SURFACE_STYLE,
  height: PLAN_HEADER_HEIGHT,
  padding: '6px 4px',
  borderRadius: '10px 0 0 10px',
}
const SHOW_TAB_STYLE: CSSProperties = {
  ...FOLD_TAB_SURFACE_STYLE,
  height: PLAN_HEADER_HEIGHT,
  padding: '6px 4px',
  borderRadius: '0 10px 10px 0',
}

const resolveChevronRotation = (isMapVisible: boolean, splitMode: boolean) => {
  if (splitMode) {
    // The map row collapses upward and expands downward.
    return isMapVisible ? 'rotate-180' : ''
  }
  // The map column collapses to the left and expands to the right.
  return isMapVisible ? 'rotate-90' : '-rotate-90'
}

/**
 * Edge tab that folds or unfolds the desktop map. Vertical so it stays
 * narrow enough to sit on a column edge without covering panel headers.
 */
export function MapToggleTab({ isMapVisible, splitMode, onToggle }: MapToggleTabProps) {
  return (
    <BasicButton
      params={{
        onClick: onToggle,
        variant: 'ghost',
        ariaLabel: isMapVisible ? 'Hide map' : 'Show map',
        style: isMapVisible ? HIDE_TAB_STYLE : SHOW_TAB_STYLE,
      }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1 text-[var(--color-muted)]">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]/90"
          style={{ writingMode: 'vertical-rl' }}
        >
          map
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${resolveChevronRotation(isMapVisible, splitMode)}`}
        />
      </div>
    </BasicButton>
  )
}
