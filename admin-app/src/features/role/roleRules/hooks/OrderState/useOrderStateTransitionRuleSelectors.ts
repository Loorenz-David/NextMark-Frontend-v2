import {
  selectAllOrderStateTransitionRules,
  selectOrderStateTransitionRuleByClientId,
  selectOrderStateTransitionRuleByServerId,
  selectOrderStateTransitionRulesByRoleId,
  useOrderStateTransitionRuleStore,
} from '@/features/role/roleRules/store/orderStateTransitionRuleStore'

export const useOrderStateTransitionRules = () =>
  useOrderStateTransitionRuleStore(selectAllOrderStateTransitionRules)

export const useOrderStateTransitionRuleByClientId = (clientId: string | null | undefined) =>
  useOrderStateTransitionRuleStore(selectOrderStateTransitionRuleByClientId(clientId))

export const useOrderStateTransitionRuleByServerId = (id: number | null | undefined) =>
  useOrderStateTransitionRuleStore(selectOrderStateTransitionRuleByServerId(id))

export const useOrderStateTransitionRulesByRoleId = (roleId: number | null | undefined) =>
  useOrderStateTransitionRuleStore(selectOrderStateTransitionRulesByRoleId(roleId))
