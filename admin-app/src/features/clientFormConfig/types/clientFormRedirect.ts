/** A saved page the public form can send the customer to after they submit. */
export type ClientFormRedirect = {
  id?: number
  client_id: string
  label: string
  url: string
  /** At most one per team; with none active the form stays on its confirmation. */
  is_active: boolean
}

export type ClientFormRedirectMap = {
  byClientId: Record<string, ClientFormRedirect>
  allIds: string[]
}

/** `is_active` is absent on purpose — activation has its own endpoint. */
export type ClientFormRedirectCreateFields = {
  client_id: string
  label: string
  url: string
}

export type ClientFormRedirectUpdateFields = Partial<Omit<ClientFormRedirectCreateFields, 'client_id'>>
