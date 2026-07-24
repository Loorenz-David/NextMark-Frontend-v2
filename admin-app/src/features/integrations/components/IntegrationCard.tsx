
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { IntegrationDefinition } from '../types/integration'
import { ICONS } from '../constants/Icons'

type IntegrationCardProps = {
  definition: IntegrationDefinition
  isActive: boolean
  onAdd: () => void
  onEdit: () => void
  onRemove: () => void
}



export const IntegrationCard = ({
  definition,
  isActive,
  onAdd,
  onEdit,
  onRemove,
}: IntegrationCardProps) => {
  const Icon = ICONS[definition.iconKey]

  return (
    <div className="admin-glass-panel-strong flex min-h-[24rem] w-[20rem] min-w-[20rem] flex-col rounded-3xl p-5 shadow-none">
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border bg-surface-raised text-[var(--color-text)]">
            <Icon.icon className={Icon.size} />
          </div>
          <div className="pt-1">
            {isActive ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-success-border bg-success-bg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Available
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
            Integration
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">{definition.name}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{definition.description}</p>
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full rounded-3xl border border-dashed border-border bg-surface-subtle px-4 py-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Status overview
            </p>
            <p className="mt-2 text-sm text-[var(--color-text)]">
              {isActive
                ? 'This integration is connected and available for configuration.'
                : 'Connect this provider to enable its automation and sync flows.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col items-center gap-2">
        {!isActive ? (
          <BasicButton params={{ 
            onClick: onAdd,
            variant:'primary',
            className:"w-full"
            }}>
            Connect
          </BasicButton>
        ) : (
          <>
            <BasicButton params={{ 
              onClick: onEdit,
              variant:'secondary',
              className:"w-full"
            }}>
              Edit
            </BasicButton>
            <BasicButton params={{ 
              onClick: onRemove, 
              variant:'secondary',
              className:"w-full border-danger-border bg-danger-bg text-danger hover:bg-danger-bg"
            }}>
              Remove
            </BasicButton>
          </>
        )}
      </div>
    </div>
  )
}
