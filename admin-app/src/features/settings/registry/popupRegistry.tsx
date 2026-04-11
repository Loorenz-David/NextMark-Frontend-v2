import type { StackComponentProps } from '@/shared/stack-manager/types'

import { UserEdit } from '@/features/user/popups/UserEdit/UserEdit'
import { InviteMember } from '@/features/team/popups/InviteMember/InviteMember'
import { IntegrationConfig } from '@/features/integrations/popups/IntegrationConfig/IntegrationConfig'
import { ItemTypeForm } from '@/features/itemConfigurations/popups/ItemTypeForm/ItemTypeForm'
import { ItemPropertyForm } from '@/features/itemConfigurations/popups/ItemPropertyForm/ItemPropertyForm'
import { ItemPositionForm } from '@/features/itemConfigurations/popups/ItemPositionForm/ItemPositionForm'
import { ItemStateForm } from '@/features/itemConfigurations/popups/ItemStateForm/ItemStateForm'
import { VehicleForm } from '@/features/infrastructure/vehicle/popups/VehicleForm/VehicleForm'
import { FacilityForm } from '@/features/infrastructure/facility/popups/FacilityForm/FacilityForm'

export type SectionKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type SettingsPopupsPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

const placeholderPopup = () => <div />

export const popupRegistry = {
  'user.edit': UserEdit,
  'team.invite.create': InviteMember,
  'integrations.config': IntegrationConfig,
  'item.type.form': ItemTypeForm,
  'item.property.form': ItemPropertyForm,
  'item.position.form': ItemPositionForm,
  'item.state.form': ItemStateForm,
  'vehicle.form': VehicleForm,
  'facility.form': FacilityForm,
  'settings.placeholder': placeholderPopup,
}
