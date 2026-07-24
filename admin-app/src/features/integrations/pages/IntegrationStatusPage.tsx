import { BasicButton } from '@/shared/buttons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ICONS } from '../constants/Icons'
import type { IntegrationKey } from '../types/integration'
import { SettingIcon } from '@/assets/icons'

type IntegrationStatus = 'connected' | 'failed' | 'pending'

export const IntegrationStatusPage = () => {
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const integration = params.get('integration') as IntegrationKey
    const status = params.get('status') as IntegrationStatus | null
    const shop = params.get('shop')

    if (!integration || !status) {
        return (
        <div className="p-6">
            <h1 className="text-lg font-semibold">Integration</h1>
            <p className="text-danger">Missing integration status.</p>
        </div>
        )
    }

    let Icon = null
    if(integration in ICONS){
        Icon = ICONS[integration]
    }
    

  const statusConfig = {
    connected: {
      title: 'Connected',
      color: 'text-success',
      description: 'The integration was successfully connected.',
    },
    failed: {
      title: 'Connection failed',
      color: 'text-danger',
      description: 'Something went wrong during the connection.',
    },
    pending: {
      title: 'Pending',
      color: 'text-warning',
      description: 'The integration is still being processed.',
    },
  }[status]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--color-page)] p-6 text-center">
      <div className="admin-glass-panel-strong relative flex w-full max-w-2xl flex-col overflow-hidden rounded-4xl p-8 shadow-none">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.1)] blur-3xl" />
        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-border bg-surface-raised text-[rgb(var(--color-light-blue-r))]">
            <SettingIcon className="h-8 w-8" />
          </div>
        {Icon ? (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface-raised text-[var(--color-text)]">
            <Icon.icon className={Icon.size} />
          </div>
        ) : null}

        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
          Integration status
        </p>
        <h1 className="mt-3 text-[2rem] font-semibold capitalize text-[var(--color-text)]">
          {integration} integration
        </h1>
        <p className={`mt-3 text-lg font-medium ${statusConfig.color}`}>
          {statusConfig.title}
        </p>

        <div className="mt-6 flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-border bg-surface-raised p-5">
          <p className="max-w-md text-sm leading-6 text-[var(--color-text)]">
            {statusConfig.description}
          </p>
          {shop && (
            <p className="text-sm text-[var(--color-muted)]">
              <span className="font-medium text-[var(--color-text)]">Shop:</span> {shop}
            </p>
          )}
        </div>


        <div className="mt-6">
          <BasicButton params={{
            onClick:() => navigate('/'),
            variant:"primary"
          }}
          >
            Back to Home
          </BasicButton>
        </div>
        </div>
      </div>
    </div>
  )
}
