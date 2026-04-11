import type { ReactNode } from 'react'
import { PublicBackdrop } from './PublicBackdrop'

type PublicPageShellProps = {
  children: ReactNode
}

export const PublicPageShell = ({ children }: PublicPageShellProps) => {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#131a1b]">
      <PublicBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
