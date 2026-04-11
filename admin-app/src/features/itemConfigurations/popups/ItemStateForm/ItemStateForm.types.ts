export type ItemStateFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ItemStateFormState = {
  name: string
  color: string
  description: string
  index: string
}
