export type ItemType = {
  id?: number
  client_id: string
  name: string
  properties?: number[]
}

export type ItemTypeMap = {
  byClientId: Record<string, ItemType>
  allIds: string[]
}

export type ItemTypePayload = {
  client_id: string
  name: string
  properties?: number[]
}
