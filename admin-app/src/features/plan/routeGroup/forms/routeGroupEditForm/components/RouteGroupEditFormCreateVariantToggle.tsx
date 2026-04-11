import { Switch } from '@/shared/inputs/Switch'
import { InfoHover } from '@/shared/layout/InfoHover'

import { useRouteGroupEditForm } from '../RouteGroupEditForm.context'
import { ROUTE_GROUP_CREATE_VARIANT_INFO } from '../info/createVariant.info'

export const RouteGroupEditFormCreateVariantToggle = () => {
  const { formState, formSetters } = useRouteGroupEditForm()

  return (
    <div className="admin-glass-panel admin-surface-compact flex items-center justify-between rounded-xl border border-white/10 p-4">
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text)]">Create variant on save</p>
          <InfoHover content={ROUTE_GROUP_CREATE_VARIANT_INFO} />
        </div>
        <p className="mt-1 text-xs text-[var(--color-muted)]/90">
          Save changes as a new variant instead of overwriting the current one.
        </p>
      </div>
      <Switch
        value={formState.create_variant_on_save}
        onChange={formSetters.handleCreateVariantToggle}
        ariaLabel="Create variant on save"
        className="border-white/12 bg-white/[0.04] shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
      />
    </div>
  )
}
