import type { ReactNode } from 'react'
import { PublicBackdrop } from './PublicBackdrop'

type PublicCenteredStateProps = {
  title?: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
}

export const PublicCenteredState = ({
  title,
  description,
  icon,
  children,
}: PublicCenteredStateProps) => {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--paper)] px-4 text-[var(--ink)]">
      <PublicBackdrop />
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 text-center">
        {icon ?? null}
        {title ? (
          <h1 className="text-2xl font-normal tracking-[0.01em] text-[var(--ink)]">{title}</h1>
        ) : null}
        {description ? (
          <p className="text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  )
}
