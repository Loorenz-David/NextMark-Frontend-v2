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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4">
      <PublicBackdrop />
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 text-center">
        {icon ?? null}
        {title ? <h1 className="text-xl font-semibold text-white/90">{title}</h1> : null}
        {description ? <p className="text-sm text-white/46">{description}</p> : null}
        {children}
      </div>
    </div>
  )
}
