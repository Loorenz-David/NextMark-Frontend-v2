export type ClientFormRuleFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ClientFormRuleFormState = {
  title: string
  body: string
  icon: string
  image_url: string
  enabled: boolean
}
