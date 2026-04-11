export type ItemPositionFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ItemPositionFormState = {
  name: string
  description: string
  default: boolean
  is_system: boolean
}
