import { buildClientId } from '@/lib/utils/clientId'
import type { PrintTemplate } from '../types'

export const buildTemplateClientId = (channel: PrintTemplate['channel'], event: PrintTemplate['event']) =>
  buildClientId(`label_template_${channel}_${event}`)

export const printTemplateNormalization = (payload: PrintTemplate): PrintTemplate => {
  return {
    ...payload,
    client_id: payload.client_id ??  buildTemplateClientId(payload.channel, payload.event),
  }
}

export const printTemplateStateNormalization = (payload: PrintTemplate): Partial<PrintTemplate> => {
  return {
    enable: payload.enable ?? false,
    ask_permission: payload.ask_permission ?? false,
    orientation:payload.orientation ?? 'horizontal',
    selected_variant: payload.selected_variant ?? 'classic'
  }
}
