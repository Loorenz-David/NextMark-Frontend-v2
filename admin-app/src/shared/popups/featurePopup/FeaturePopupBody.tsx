import type { ReactNode } from 'react'

type FeaturePopupBodyProps = {
  children: ReactNode
  className?: string
}

export const FeaturePopupBody = ({ children, className }: FeaturePopupBodyProps) => (
  <div className={`relative flex-1 overflow-hidden ${className ?? ''}`.trim()}>{children}</div>
)
