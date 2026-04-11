import type { CSSProperties } from 'react'

import { DEFAULT_LAUNCHER_SIZE, OVERLAY_Z_INDEX } from './constants'
import type { AiPanelMessage, AiPanelTheme } from './types'

export function panelShellStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    display: 'flex',
    flexDirection: 'column',
    isolation: 'isolate',
    borderRadius: 28,
    border: `1px solid ${theme.border}`,
    background: theme.background,
    backdropFilter: 'blur(24px)',
    boxShadow: theme.shadow,
    color: theme.text,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  }
}

export function mobileSheetStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    left: 0,
    right: 0,
    bottom: 0,
    height: '78dvh',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    border: `1px solid ${theme.border}`,
    background: theme.background,
    backdropFilter: 'blur(24px)',
    boxShadow: theme.shadow,
    color: theme.text,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  }
}

export function buttonStyle(
  theme: AiPanelTheme,
  variant: 'primary' | 'secondary' | 'ghost',
  disabled = false,
): CSSProperties {
  const shared: CSSProperties = {
    borderRadius: 999,
    border: '1px solid transparent',
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'opacity 120ms ease, transform 120ms ease',
  }

  if (variant === 'primary') {
    return {
      ...shared,
      background: theme.accent,
      color: '#132118',
    }
  }

  if (variant === 'secondary') {
    return {
      ...shared,
      background: theme.surfaceAlt,
      borderColor: theme.border,
      color: theme.text,
    }
  }

  return {
    ...shared,
    background: 'transparent',
    borderColor: theme.border,
    color: theme.muted,
  }
}

export const manualLauncherButtonStyle: CSSProperties = {
  borderRadius: 999,
  padding: '10px 14px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(18, 24, 27, 0.82)',
  color: '#F5F7F5',
  cursor: 'pointer',
}

export function launcherStyle(theme: AiPanelTheme["launcher"]): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    width: DEFAULT_LAUNCHER_SIZE.width,
    height: DEFAULT_LAUNCHER_SIZE.height,
    borderRadius: 999,
    border: `1px solid ${theme.border}`,
    backdropFilter: 'blur(18px)',
    background: theme.background,
    color: theme.text,
    boxShadow: theme.shadow,
    cursor: 'grab',
    overflow: 'hidden',
  }
}

export function messageCardStyle(
  theme: AiPanelTheme,
  role: AiPanelMessage['role'],
): CSSProperties {
  const base: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    borderRadius: 24,
    padding: 16,
    border: `1px solid ${theme.border}`,
    maxWidth: '100%',
  }

  if (role === 'user') {
    return {
      ...base,
      background: 'rgba(92, 92, 92, 0.62)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: theme.text,
      width: 'fit-content',
      maxWidth: '86%',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }
  }

  if (role === 'error') {
    return {
      ...base,
      background: 'rgba(115, 27, 32, 0.76)',
      color: '#FFECEC',
    }
  }

  if (role === 'status') {
    return {
      ...base,
      background: 'rgba(30, 43, 49, 0.78)',
      color: theme.text,
    }
  }

  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: theme.text,
    maxWidth: '100%',
  }
}

export const transcriptStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '78px 22px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}

export function emptyStateStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: '18px 6px 8px',
    color: theme.muted,
  }
}

export function headerStyle(theme: AiPanelTheme["header"], visible: boolean, mobile = false): CSSProperties {
  return {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.backgroundColor,
    gap: 12,
    padding: '5px 16px 5px',
    opacity: mobile || visible ? 1 : 0,
    transform: mobile || visible ? 'translateY(0)' : 'translateY(-10px)',
    pointerEvents: mobile || visible ? 'auto' : 'none',
    transition: 'opacity 180ms ease, transform 180ms ease',
  }
}

export function dragHandleStyle(theme: AiPanelTheme["header"]): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'grab',
    minWidth: 0,
    flex: '0 0 auto',
    color: theme.text,
    userSelect: 'none',
  }
}

export const headerActionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  gap: 10,
  flexWrap: 'wrap',
  minWidth: 88,
  minHeight: 40,
}

export function headerActionDockStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  }
}

export function headerCloseButtonStyle(theme: AiPanelTheme["header"]): CSSProperties {
  return {
    width: 30,
    height: 30,
    
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 999,
    background: 'rgba(76, 78, 78, 0.64)',
    color: theme.muted,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    backdropFilter: 'blur(14px)',
     
  }
}

export const headerCloseGlyphStyle: CSSProperties = {
  fontSize: 20,
  lineHeight: 1,
  transform: 'translateY(-1px)',
}

export function headerEyebrowStyle(theme: AiPanelTheme): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 14,
    background: theme.surfaceAlt,
    color: theme.accent,
    fontWeight: 800,
    letterSpacing: '0.12em',
    fontSize: 11,
  }
}

export function headerTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontWeight: 700,
    fontSize: 17,
    lineHeight: 1.2,
  }
}

export function headerSubtitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  }
}

export function composerShellStyle(theme: AiPanelTheme["composer"]): CSSProperties {
  return {
    padding: '18px 18px 20px',
    borderTop: `1px solid ${theme.border}`,
    background: 'rgba(9, 13, 15, 0.28)',
  }
}

export function composerFrameStyle(theme: AiPanelTheme["composer"]): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 20,
    border: `1px solid ${theme.border}`,
    background: 'linear-gradient(180deg, rgba(56,58,58,0.72), rgba(44,46,46,0.9))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 48px rgba(0,0,0,0.24)',
    overflow: 'hidden',
    backdropFilter: 'blur(18px)',
    color: theme.text,
  }
}

export function composerTopRowStyle(): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
  }
}

export function composerInputStyle(theme: AiPanelTheme["composer"]): CSSProperties {
  return {

    overflowY: 'auto',
    width: '100%',
    resize: 'none',
    border: 'none',
    padding: '10px 14px',
    background: 'transparent',
    color: theme.text,
    outline: 'none',
    minHeight: 40,
    maxHeight: 160,
    fontSize: 14,
    lineHeight: 1.65,
    fontFamily: theme.fontFamily,
  }
}

export const composerFooterStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  width: '100%',
  padding: '5px 10px ',
  minHeight: 40,
}

export function composerActionsRowStyle(theme: AiPanelTheme["composer"]): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,

  }
}

export function composerHintStyle(theme: AiPanelTheme["composer"]): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 12,
    opacity: 0.88,
  }
}

export function composerSubmitButtonStyle(
  theme: AiPanelTheme["composer"],
  disabled = false,
): CSSProperties {
  return {
    borderRadius: 999,
    padding: '5px 5px',
    background: theme.accent,
    color: '#132118',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'opacity 120ms ease, transform 120ms ease',
  }
}



export function launcherLabelStyle(theme: AiPanelTheme["launcher"]): CSSProperties {
  return {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontWeight: theme.fontWeight,
    letterSpacing: '0.14em',
    fontSize: theme.fontSize,
    color: theme.text,
    fontFamily: theme.fontFamily,
  }
}

export function emptyStateTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    fontWeight: 700,
    color: theme.text,
    marginBottom: 6,
  }
}

export function emptyStateBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    lineHeight: 1.5,
    fontSize: 14,
  }
}

export function messageHeaderStyle(theme: AiPanelTheme["header"], isUser: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    color: isUser ? 'rgba(255,255,255,0.72)' : theme.muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: isUser ? 'rgba(255,255,255,0.08)' : 'transparent',
  }
}

export function messageBadgeStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: '4px 8px',
    borderRadius: 999,
    background: theme.surfaceAlt,
    color: theme.text,
    fontSize: 10,
    letterSpacing: '0.05em',
  }
}

export function messageBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontSize: 14,
    lineHeight: 1.62,
    whiteSpace: 'pre-wrap',
  }
}

export function assistantMessageBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontSize: 17,
    lineHeight: 1.72,
    whiteSpace: 'pre-wrap',
    letterSpacing: '-0.01em',
  }
}

export const actionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}

export function detailsStyle(theme: AiPanelTheme): CSSProperties {
  return {
    borderRadius: 18,
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
  }
}

export function summaryStyle(theme: AiPanelTheme): CSSProperties {
  return {
    cursor: 'pointer',
    padding: '12px 14px',
    color: theme.text,
    fontWeight: 600,
    fontSize: 13,
  }
}

export const traceListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '0 12px 12px',
}

export function traceItemStyle(theme: AiPanelTheme): CSSProperties {
  return {
    borderRadius: 16,
    padding: 12,
    background: 'rgba(0,0,0,0.16)',
    border: `1px solid ${theme.border}`,
  }
}

export const traceItemHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 6,
}

export function traceToolNameStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontWeight: 700,
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  }
}

export function traceStatusStyle(
  theme: AiPanelTheme,
  status: 'success' | 'error' | 'info',
): CSSProperties {
  const color =
    status === 'success' ? theme.accent : status === 'error' ? '#FF9B9B' : theme.muted

  return {
    color,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
  }
}

export function traceSummaryStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 8,
  }
}

export function traceCodeStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: 11,
    lineHeight: 1.45,
    padding: 10,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.22)',
    color: theme.text,
  }
}

export function dataPreviewStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    padding: 12,
    borderRadius: 16,
    background: theme.surfaceAlt,
    color: theme.text,
    fontSize: 11,
    lineHeight: 1.45,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  }
}

export const messageFooterStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: -1,
}

export function statusMessageStyle(theme: AiPanelTheme): CSSProperties {
  return {
    alignSelf: 'stretch',
    borderRadius: 18,
    padding: 14,
  }
}

export function statusTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    fontWeight: 700,
    color: theme.text,
    marginBottom: 4,
  }
}

export function statusBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 13,
  }
}

export function mobileHandleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    width: 54,
    height: 6,
    borderRadius: 999,
    background: theme.border,
    alignSelf: 'center',
    marginTop: 10,
  }
}
