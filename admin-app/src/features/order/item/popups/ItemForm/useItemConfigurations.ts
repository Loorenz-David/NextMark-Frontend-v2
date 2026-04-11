
import type { ItemType } from "@/features/itemConfigurations/types/itemType"
import { useMemo } from "react"

import type { ItemProperty } from "@/features/itemConfigurations/types/itemProperty"
import { useItemTypesOrFetch } from "@/features/itemConfigurations/hooks/useItemConfigSelectors"
import { useItemPropertiesOrFetch } from "@/features/itemConfigurations/hooks/useItemConfigSelectors"


export type itemTypeOption = {
  label: string
  value: ItemType
}
export type selectedItemTypeProperties = ItemProperty[]

export const useItemConfigurations = ({
  selectedItemTypeName,
}: {
  selectedItemTypeName?: string | null
}) => {
    const itemTypes = useItemTypesOrFetch()
    const itemTypeProperties = useItemPropertiesOrFetch()

    const itemTypeOptions = useMemo(
      () =>
        itemTypes.map((itemType) => ({
          label: itemType.name,
          value: itemType,
        })),
      [itemTypes],
    )

    const selectedItemType = useMemo(() => {
      const normalizedName = selectedItemTypeName?.trim()
      if (!normalizedName) {
        return null
      }

      return itemTypes.find((itemType) => itemType.name.trim() === normalizedName) ?? null
    }, [itemTypes, selectedItemTypeName])
    
    const selectedItemTypeProperties = useMemo(() => {
      const propertyIds = selectedItemType?.properties 
      if (!propertyIds ) return []

      return itemTypeProperties.filter((property) =>
        propertyIds.includes(property.id ?? -1),
      )
    }, [selectedItemType, itemTypeProperties])
  
   
  return {
    itemTypeOptions,
    selectedItemTypeProperties,
    selectedItemType,
  }
}
