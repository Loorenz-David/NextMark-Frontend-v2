import type { ZoneState } from '@/features/zone/types'

import {
  getInitialZoneTemplateFormFields,
  type ZoneTemplateFormFields,
} from './zoneTemplateForm.domain'

export type ZoneFormState = {
  name: string
  zone_color: string
} & ZoneTemplateFormFields

export const buildInitialZoneFormState = (
  zone: ZoneState | null | undefined,
): ZoneFormState => {
  const templateFields = getInitialZoneTemplateFormFields(zone?.template_full)
  const resolvedZoneName = zone?.name ?? ''

  return {
    name: resolvedZoneName,
    zone_color: zone?.zone_color ?? '#111111',
    ...templateFields,
    template_name: resolvedZoneName || templateFields.template_name,
  }
}
