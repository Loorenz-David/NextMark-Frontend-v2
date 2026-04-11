
import type { EmailTemplateValue } from './emailTemplate'

export type TemplateValue = EmailTemplateValue | Record<string, unknown> | unknown[] | null


export type EmailMessageTemplate = {
  id?: number 
  client_id: string
  name: string
  event: string
  enable?: boolean | null
  ask_permission?: boolean | null
  template?: TemplateValue
  content?: TemplateValue
  channel: 'email'
  timestampt?: string | null
}

export type EmailMessageTemplateMap = {
  byClientId: Record<string, EmailMessageTemplate>
  allIds: string[]
}

export type EmailMessageTemplatePayload = {
  client_id: string
  name: string
  event: string
  ask_permission?: boolean | null
  enable?: boolean | null
  template?: TemplateValue
  channel: 'email'
}
