import type { ReactNode } from 'react'

type Props = { children: ReactNode }

export const StepLayout = ({ children }: Props) => (
  // A card of stock laid on the page: hairline border, faint lift, softened corners.
  <section className="relative rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-6 shadow-[0_1px_0_0_var(--rule)] sm:p-8">
    {children}
  </section>
)
