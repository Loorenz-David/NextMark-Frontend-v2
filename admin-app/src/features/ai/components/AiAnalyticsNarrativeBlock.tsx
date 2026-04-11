import { memo } from 'react'

interface AiAnalyticsNarrativeBlockProps {
  title?: string
  subtitle?: string
  text: string
}

function AiAnalyticsNarrativeBlockComponent({ title, subtitle, text }: AiAnalyticsNarrativeBlockProps) {
  return (
    <div className="admin-glass-panel admin-surface-compact flex flex-col gap-2 rounded-lg border border-white/10 p-4">
      {title ? (
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {title}
        </div>
      ) : null}
      <div className="text-sm leading-6 text-[var(--color-text)]/95">
        {text}
      </div>
      {subtitle ? (
        <div className="text-xs text-[var(--color-muted)]/95">
          {subtitle}
        </div>
      ) : null}
    </div>
  )
}

export const AiAnalyticsNarrativeBlock = memo(AiAnalyticsNarrativeBlockComponent)