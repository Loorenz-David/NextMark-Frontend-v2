
import { useMemo } from "react"

import type { ItemProperty } from "@/features/itemConfigurations/types/itemProperty"
import type { ItemType } from "@/features/itemConfigurations/types/itemType"
import { useItemPositionsOrFetch, useItemPropertiesOrFetch, useItemTypesOrFetch } from "@/features/itemConfigurations/hooks/useItemConfigSelectors"


export type itemTypeOption = {
  label: string
  value: ItemType
}
export type itemPositionOption = {
  label: string
  value: string
}
export type selectedItemTypeProperties = ItemProperty[]

export const useItemConfigurations = ({
  selectedItemTypeName,
}: {
  selectedItemTypeName?: string | null
}) => {
    const itemTypes = useItemTypesOrFetch()
    const itemTypeProperties = useItemPropertiesOrFetch()
    const itemPositions = useItemPositionsOrFetch()

    const itemTypeOptions = useMemo(
      () =>
        itemTypes.map((itemType) => ({
          label: itemType.name,
          value: itemType,
        })),
      [itemTypes],
    )

    const itemPositionOptions = useMemo(
      () =>
        itemPositions.map((itemPosition) => ({
          label: itemPosition.name,
          value: itemPosition.name,
        })),
      [itemPositions],
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
    itemPositionOptions,
    selectedItemTypeProperties,
    selectedItemType,
  }
}
