import type { ItemType, ItemTypeMap } from '../types/itemType'

type EnsureItemTypesLoadedDependencies = {
  getStoredItemTypes: () => ItemType[]
  loadItemTypes: () => Promise<ItemTypeMap>
  insertItemTypes: (itemTypes: ItemTypeMap) => void
}

export const createEnsureItemTypesLoadedFlow = ({
  getStoredItemTypes,
  loadItemTypes: load,
  insertItemTypes: insert,
}: EnsureItemTypesLoadedDependencies) => {
  let inFlightRequest: Promise<ItemType[]> | null = null

  return async (): Promise<ItemType[]> => {
    const storedItemTypes = getStoredItemTypes()
    if (storedItemTypes.length > 0) {
      return storedItemTypes
    }

    if (inFlightRequest) {
      return inFlightRequest
    }

    const request = (async () => {
      const itemTypes = await load()
      insert(itemTypes)
      return getStoredItemTypes()
    })()

    inFlightRequest = request

    try {
      return await request
    } finally {
      if (inFlightRequest === request) {
        inFlightRequest = null
      }
    }
  }
}
