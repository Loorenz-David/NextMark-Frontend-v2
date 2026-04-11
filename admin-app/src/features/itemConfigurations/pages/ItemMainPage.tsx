import { useMemo, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { ItemIcon } from '@/assets/icons'

import { ItemTypesPage } from './ItemTypesPage'
import { ItemPropertiesPage } from './ItemPropertiesPage'
import { ItemPositionsPage } from './ItemPositionsPage'
import { ItemStatesPage } from './ItemStatesPage'

type ItemTabKey = 'types' | 'properties' | 'positions' | 'states'

const TABS: { key: ItemTabKey; label: string }[] = [
  { key: 'types', label: 'Types' },
  { key: 'properties', label: 'Properties' },
  { key: 'positions', label: 'Positions' },
  { key: 'states', label: 'States' },
]

const ItemMainContent = () => {
  const [activeTab, setActiveTab] = useState<ItemTabKey>('types')

  const content = useMemo(() => {
    switch (activeTab) {
      case 'properties':
        return <ItemPropertiesPage />
      case 'positions':
        return <ItemPositionsPage />
      case 'states':
        return <ItemStatesPage />
      case 'types':
      default:
        return <ItemTypesPage />
    }
  }, [activeTab])

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <ItemIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Item Configuration
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Item settings
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Manage the structure, states, and metadata that define how items behave across the platform.
            </p>
          </div>
        </div>
      </section>

      <div className="admin-glass-panel-strong flex gap-4 rounded-[28px] p-4 shadow-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.14)] text-[rgb(var(--color-light-blue-r))]'
                : 'border border-white/[0.05] bg-white/[0.04] text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {content}
      </div>
    </div>
  )
}

export const ItemMainPage = (_: StackComponentProps<undefined>) => (
  <>
    <ItemMainContent />
  </>
)
