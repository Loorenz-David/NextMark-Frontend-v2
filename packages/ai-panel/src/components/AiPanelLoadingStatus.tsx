import { statusBodyStyle, statusTitleStyle } from '../styles'
import type { AiPanelTheme } from '../types'

interface AiPanelLoadingStatusProps {
  theme: AiPanelTheme
  statusText: string
}

const SHIMMER_ANIMATION_NAME = 'ai-panel-loading-shimmer'

export function AiPanelLoadingStatus({ theme, statusText }: AiPanelLoadingStatusProps) {
  return (
    <>
      <style>
        {`@keyframes ${SHIMMER_ANIMATION_NAME} {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`}
      </style>
      <div style={statusTitleStyle(theme)}>Working</div>
      <div
        style={{
          ...statusBodyStyle(theme),
          display: 'inline-block',
          fontWeight: 600,
          backgroundImage: `linear-gradient(90deg, ${theme.muted} 0%, ${theme.muted} 28%, ${theme.text} 50%, ${theme.muted} 72%, ${theme.muted} 100%)`,
          backgroundSize: '260% 100%',
          backgroundPosition: '0% 0%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          animation: `${SHIMMER_ANIMATION_NAME} 3.2s linear infinite`,
        }}
      >
        {statusText}
      </div>
    </>
  )
}
