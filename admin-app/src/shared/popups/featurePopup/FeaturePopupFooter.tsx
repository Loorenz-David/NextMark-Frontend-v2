import type { ReactNode } from 'react'

type FeaturePopupFooterProps = {
  children: ReactNode
  className?: string
}

export const FeaturePopupFooter = ({ children, className }: FeaturePopupFooterProps) => (
  <footer
    className={(
      `absolute bottom-0 left-0 z-10 flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--surface-popup-chrome)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-5 ${className ?? ''}`
    ).trim()}
  >
    {children}
  </footer>
)
