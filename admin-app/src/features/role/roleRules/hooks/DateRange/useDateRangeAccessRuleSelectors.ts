import {
  selectAllDateRangeAccessRules,
  selectDateRangeAccessRuleByClientId,
  selectDateRangeAccessRuleByServerId,
  selectDateRangeAccessRulesByRoleId,
  useDateRangeAccessRuleStore,
} from '@/features/role/roleRules/store/dateRangeAccessRuleStore'

export const useDateRangeAccessRules = () =>
  useDateRangeAccessRuleStore(selectAllDateRangeAccessRules)

export const useDateRangeAccessRuleByClientId = (clientId: string | null | undefined) =>
  useDateRangeAccessRuleStore(selectDateRangeAccessRuleByClientId(clientId))

export const useDateRangeAccessRuleByServerId = (id: number | null | undefined) =>
  useDateRangeAccessRuleStore(selectDateRangeAccessRuleByServerId(id))

export const useDateRangeAccessRulesByRoleId = (roleId: number | null | undefined) =>
  useDateRangeAccessRuleStore(selectDateRangeAccessRulesByRoleId(roleId))
