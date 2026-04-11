export type ItemStateEntryPoints = 'initial' | 'completed' | 'fail' 

export type ItemState = {
  id?: number
  client_id: string
  name: string
  color?: string | null
  default?: boolean
  description?: string | null
  index?: number | null
  is_system?: boolean
  entry_point?: ItemStateEntryPoints | null
}

export type ItemStateMap = {
  byClientId: Record<string, ItemState>
  allIds: string[]
}

export type ItemStatePayload = {
  client_id: string
  name: string
  color?: string | null
  default?: boolean
  description?: string | null
  index?: number | null
  is_system?: boolean
  entry_point?: 'initial' | 'completed' | 'fail' | string | null
}

