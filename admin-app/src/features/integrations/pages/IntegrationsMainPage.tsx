import type { StackComponentProps } from '@/shared/stack-manager/types'
import { SettingIcon } from '@/assets/icons'

import { IntegrationsProvider } from '../context/IntegrationsProvider'
import { useIntegrationsContext } from '../context/useIntegrationsContext'
import { IntegrationsCarousel } from '../components/IntegrationsCarousel'

const IntegrationsPageContent = () => {
  const { integrations, openIntegrationConfig, removeIntegration } = useIntegrationsContext()

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <SettingIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Integrations
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              External integrations
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Connect external services, manage authentication, and control the tools available to your workspace.
            </p>
          </div>
        </div>
      </section>

      <IntegrationsCarousel
        integrations={integrations}
        onAdd={(key) => openIntegrationConfig(key, 'create', null)}
        onEdit={(key, integrationId) => openIntegrationConfig(key, 'edit', integrationId)}
        onRemove={removeIntegration}
      />
    </div>
  )
}

export const IntegrationsMainPage = (_: StackComponentProps<undefined>) => (
  <IntegrationsProvider>
    <IntegrationsPageContent />
  </IntegrationsProvider>
)
