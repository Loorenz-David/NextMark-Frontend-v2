import { useRoutePlanByClientId } from '../store/useRoutePlan.selector'

export const usePlanTypeWithFetch = (clientId: string | null | undefined) => {
  const plan = useRoutePlanByClientId(clientId)
  return plan ? 'local_delivery' : null
}
