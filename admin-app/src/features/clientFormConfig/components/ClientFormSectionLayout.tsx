import type { ReactNode } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'

type ClientFormSectionLayoutProps = {
  title: string
  description: string
  /** Settings toggles governing this section live here, beside what they control. */
  toggles?: ReactNode
  createLabel?: string
  onCreate?: () => void
  headerExtra?: ReactNode
  bodyClassName?: string
  children: ReactNode
}

export const ClientFormSectionLayout = ({
  title,
  description,
  toggles,
  createLabel = 'Create',
  onCreate,
  headerExtra,
  bodyClassName,
  children,
}: ClientFormSectionLayoutProps) => (
  <section className="admin-glass-panel-strong flex h-full flex-col overflow-hidden rounded-[28px] shadow-none">
    <div className="flex flex-col gap-5 border-b border-[var(--color-border)]/70 p-5 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="text-xs text-[var(--color-muted)]">{description}</p>
        </div>
        {onCreate ? (
          <BasicButton params={{ onClick: onCreate, variant: 'primary' }}>{createLabel}</BasicButton>
        ) : null}
      </div>

      {toggles ? <div className="flex flex-col gap-3">{toggles}</div> : null}
      {headerExtra}
    </div>

    <div
      className={bodyClassName ?? 'flex flex-1 flex-col gap-4 overflow-auto bg-[var(--color-page)]/30 p-4 pt-6 scroll-thin'}
    >
      {children}
    </div>
  </section>
)
