export type ItemTypeFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ItemTypeFormState = {
  name: string
  properties: number[]
}
