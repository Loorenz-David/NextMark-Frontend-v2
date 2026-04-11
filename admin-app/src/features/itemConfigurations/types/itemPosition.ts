export type ItemPosition = {
  id?: number
  client_id: string
  name: string
  default?: boolean
  description?: string | null
  is_system?: boolean
}

export type ItemPositionMap = {
  byClientId: Record<string, ItemPosition>
  allIds: string[]
}

export type ItemPositionPayload = {
  client_id: string
  name: string
  default?: boolean
  description?: string | null
  is_system?: boolean
}
