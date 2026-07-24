import { useMemo } from 'react'

import { DocumentIcon } from '@/assets/icons'

import { useClientFormConfigController } from '../controllers/useClientFormConfigController'
import { ClientFormMediaPage } from './ClientFormMediaPage'
import { ClientFormRulesPage } from './ClientFormRulesPage'
import { ClientFormTermsPage } from './ClientFormTermsPage'

const ClientFormConfigContent = () => {
  const { activeTab, setActiveTab, tabs } = useClientFormConfigController()

  const content = useMemo(() => {
    switch (activeTab) {
      case 'rules':
        return <ClientFormRulesPage />
      case 'media':
        return <ClientFormMediaPage />
      case 'terms':
      default:
        return <ClientFormTermsPage />
    }
  }, [activeTab])

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <DocumentIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              External Form
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Form configuration
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Control the terms customers accept, the delivery rules they read, and the media shown
              on your public client form.
            </p>
          </div>
        </div>
      </section>

      <div className="admin-glass-panel-strong flex gap-4 rounded-[28px] p-4 shadow-none">
        {tabs.map((tab) => (
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

      <div className="flex min-h-[32rem] flex-1">{content}</div>
    </div>
  )
}

/** Registered as a settings section — it takes no payload. */
export const ClientFormConfigMainPage = () => <ClientFormConfigContent />

