
export type TemplateValue = 
  | Record<string, unknown>
  | unknown[]
  |null

export type SmsMessageTemplate = {
  id?: number 
  client_id: string
  name: string
  event: string
  enable?: boolean | null
  ask_permission?: boolean | null
  template?: TemplateValue
  content?: TemplateValue
  channel: 'sms'
  timestampt?: string | null
}

export type SmsMessageTemplateMap = {
  byClientId: Record<string, SmsMessageTemplate>
  allIds: string[]
}

export type SmsMessageTemplatePayload = {
  client_id: string
  name: string
  event: string
  enable?: boolean | null
  ask_permission?: boolean | null
  template?: TemplateValue
  channel: 'sms'
}
