import type { PointerEvent as ReactPointerEvent } from 'react'

import {
  buttonStyle,
  dragHandleStyle,
  headerActionDockStyle,
  headerActionsStyle,
  headerCloseButtonStyle,
  headerCloseGlyphStyle,
  headerStyle,
} from '../styles'
import type { AiPanelTheme } from '../types'

interface AiPanelHeaderProps {
  theme: AiPanelTheme
  visible: boolean
  mobile?: boolean
  closeDisabled?: boolean
  closeDisabledReason?: string
  clearDisabled?: boolean
  onClear?: () => void
  onClose: () => void
  onDragStart?: (event: ReactPointerEvent<HTMLElement>) => void
}

export function AiPanelHeader({
  theme,
  visible,
  mobile = false,
  closeDisabled = false,
  closeDisabledReason,
  clearDisabled = false,
  onClear,
  onClose,
  onDragStart,
}: AiPanelHeaderProps) {
  const headerTheme = theme.header
  return (
    <header onPointerDown={onDragStart} style={headerStyle(headerTheme, visible, mobile)}>
      <div style={dragHandleStyle(headerTheme)}>
        <button
          aria-label="Hide AI panel"
          disabled={closeDisabled}
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          style={headerCloseButtonStyle(headerTheme)}
          title={closeDisabledReason}
          type="button"
        >
          <span style={headerCloseGlyphStyle}>×</span>
        </button>
      </div>
      <div style={headerActionsStyle}>
        <div style={headerActionDockStyle()}>
          {onClear ? (
            <button
              disabled={clearDisabled}
              onClick={onClear}
              onPointerDown={(event) => event.stopPropagation()}
              style={buttonStyle(theme, 'ghost', clearDisabled)}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
