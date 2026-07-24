export type ClientFormRule = {
  id?: number
  client_id: string
  position: number
  enabled: boolean
  title: string
  body: string | null
  icon: string | null
  image_url: string | null
}

export type ClientFormRuleMap = {
  byClientId: Record<string, ClientFormRule>
  allIds: string[]
}

/** `position` is deliberately absent — the backend appends new rules to the end. */
export type ClientFormRuleCreateFields = {
  client_id: string
  title: string
  enabled?: boolean
  body?: string | null
  icon?: string | null
  image_url?: string | null
}

export type ClientFormRuleUpdateFields = Partial<Omit<ClientFormRuleCreateFields, 'client_id'>>
