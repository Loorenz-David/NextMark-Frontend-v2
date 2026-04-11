import type { ReactNode } from 'react'

type StepLayoutProps = {
  children: ReactNode
}

export const StepLayout = ({ children }: StepLayoutProps) => {
  return (
    <section className="relative rounded-[28px] border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.40)] backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_50%)]" />
      <div className="relative">{children}</div>
    </section>
  )
}
