import type { ReactNode } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { SearchBar } from '@/shared/buttons/SearchBar'

type FacilitySectionLayoutProps = {
  title: string
  description: string
  onCreate: () => void
  onSearch: (value: string) => void
  bodyClassName?: string
  children: ReactNode
}

export const FacilitySectionLayout = ({
  title,
  description,
  onCreate,
  onSearch,
  bodyClassName,
  children,
}: FacilitySectionLayoutProps) => (
  <section className="admin-glass-panel-strong flex h-full flex-col overflow-hidden rounded-[28px] shadow-none">
    <div className="flex flex-col gap-6 border-b border-[var(--color-border)]/70 p-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="text-xs text-[var(--color-muted)]">{description}</p>
        </div>
        <BasicButton params={{ onClick: onCreate, variant: 'primary' }}>
          Create
        </BasicButton>
      </div>

      <SearchBar
        onChange={(value) => onSearch(value.input ?? '')}
        className="w-full rounded-full border border-[var(--color-border)]/70 bg-white/[0.04] px-3 py-2 text-sm"
        placeholder="search facilities"
      />
    </div>
    <div className="flex flex-col gap-3">
      <div className={bodyClassName ?? 'flex h-full flex-col gap-4 bg-[var(--color-page)]/30 p-4 pt-6'}>
        {children}
      </div>
    </div>
  </section>
)
