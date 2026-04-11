import type { ReactNode } from 'react'

type FeaturePopupFooterProps = {
  children: ReactNode
  className?: string
}

export const FeaturePopupFooter = ({ children, className }: FeaturePopupFooterProps) => (
  <footer
    className={(
      `absolute bottom-0 left-0 z-10 flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 md:px-5 ${className ?? ''}`
    ).trim()}
  >
    {children}
  </footer>
)
