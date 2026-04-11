import type { ItemPropertyFieldType } from "../../types/itemProperty"


export type ItemPropertyFormPayload = {
  mode: 'create' | 'edit'
  clientId?: string
}

export type ItemPropertyFormState = {
  name: string
  field_type: ItemPropertyFieldType
  options: string[]
  required: boolean
  item_types: number[]
}
