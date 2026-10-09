export type ClientFormRedirectFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ClientFormRedirectFormState = {
  label: string
  url: string
}
