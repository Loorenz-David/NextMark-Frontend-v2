// hooks/usePlanFormContextData.ts
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import type { PopupPayload } from './PlanForm.types'

export const usePlanFormContextData = (entryPayload?: PopupPayload) => {

  const clientId = entryPayload?.clientId ?? null
  const serverId = entryPayload?.serverId ?? null
  const mode = entryPayload?.mode ?? 'create'
  const selectedOrderServerIds = entryPayload?.selectedOrderServerIds ?? []
  const source = entryPayload?.source ?? null

  const planData = useRoutePlanByServerId(serverId)


  return {
    clientId,
    mode,
    source,
    planData,
    selectedOrderServerIds,
    isEdit: mode === 'edit',
    hasPlan: !!planData,
  }
}
