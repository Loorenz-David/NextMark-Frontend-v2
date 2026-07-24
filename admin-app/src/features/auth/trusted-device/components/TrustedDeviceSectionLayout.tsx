import type { ReactNode } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { SearchBar } from '@/shared/buttons/SearchBar'

type TrustedDeviceSectionLayoutProps = {
  title: string
  description: string
  canEnroll: boolean
  onEnroll: () => void
  onReprovision: () => void
  onSearch: (value: string) => void
  bodyClassName?: string
  children: ReactNode
}

export const TrustedDeviceSectionLayout = ({
  title,
  description,
  canEnroll,
  onEnroll,
  onReprovision,
  onSearch,
  bodyClassName,
  children,
}: TrustedDeviceSectionLayoutProps) => (
  <section className="admin-glass-panel-strong flex h-full flex-col overflow-hidden rounded-3xl shadow-none">
    <div className="flex flex-col gap-6 border-b border-[var(--color-border)]/70 p-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="text-xs text-[var(--color-muted)]">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onReprovision}
            className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Re-provision
          </button>
          {canEnroll ? (
            <BasicButton params={{ onClick: onEnroll, variant: 'primary' }}>
              Add this device
            </BasicButton>
          ) : null}
        </div>
      </div>

      <SearchBar
        onChange={(value) => onSearch(value.input ?? '')}
        className="w-full rounded-full border border-[var(--color-border)]/70 bg-surface-raised px-3 py-2 text-sm"
        placeholder="search trusted devices"
      />
    </div>
    <div className="flex flex-col gap-3">
      <div className={bodyClassName ?? 'flex h-full flex-col gap-4 bg-[var(--color-page)]/30 p-4 pt-6'}>
        {children}
      </div>
    </div>
  </section>
)
