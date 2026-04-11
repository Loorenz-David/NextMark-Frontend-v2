export type ItemPropertyFieldType = 'text' | 'number' | 'select' | 'check_box' 

export type ItemProperty = {
  id?: number
  client_id: string
  name: string
  field_type: ItemPropertyFieldType
  options?: string[] 
  required?: boolean
  item_types?: number[]
}

export type ItemPropertyMap = {
  byClientId: Record<string, ItemProperty>
  allIds: string[]
}

export type ItemPropertyPayload = {
  client_id: string
  name: string
  field_type: ItemPropertyFieldType 
  options?: string[] 
  required?: boolean
  item_types?: number[]
}
