import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { ItemStateMap } from '@/features/itemConfigurations/types/itemState'
import type { OrderStateMap } from '@/features/order/types/orderState'
import type { TeamMemberMap } from '@/features/team/members/types/teamMember'
import type { PrintTemplateMap } from '../templates/printDocument/types'
import type { EmailMessageTemplateMap } from '../messaging/emailMessage/types'
import type { SmsMessageTemplateMap } from '../messaging/smsMessage/types'
import type { DeliveryPlanStateMap } from '../plan/types/planState'
import type { VehicleMap } from '../infrastructure/vehicle/types/vehicle'
import type { ZonesContext } from '../zone/types'


export type BootstrapResponse = {
  item_states: ItemStateMap
  order_states: OrderStateMap
  team_members: TeamMemberMap
  label_templates: PrintTemplateMap
  message_templates_email: EmailMessageTemplateMap 
  message_templates_sms: SmsMessageTemplateMap
  plan_states: DeliveryPlanStateMap
  vehicles?: VehicleMap
  zones_context?: ZonesContext
}

export const bootstrapApi = {
  listBootstrap: (): Promise<ApiResult<BootstrapResponse>> =>
    apiClient.request<BootstrapResponse>({
      path: '/bootstrap/',
      method: 'GET',
    }),
}
