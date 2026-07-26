import { createEnsureItemTypesLoadedFlow } from '../ensureItemTypesLoaded.factory'
import type { ItemType, ItemTypeMap } from '../../types/itemType'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runEnsureItemTypesLoadedFlowTests = async () => {
  const itemType: ItemType = {
    client_id: 'item-type-chair',
    name: 'Chair',
    label_multiplier: 2,
  }
  const response: ItemTypeMap = {
    byClientId: { [itemType.client_id]: itemType },
    allIds: [itemType.client_id],
  }
  let storedItemTypes: ItemType[] = []
  let loadCount = 0
  const pendingLoad: {
    resolve?: (value: ItemTypeMap) => void
  } = {}

  const ensureItemTypesLoaded = createEnsureItemTypesLoadedFlow({
    getStoredItemTypes: () => storedItemTypes,
    loadItemTypes: () => {
      loadCount += 1
      return new Promise<ItemTypeMap>((resolve) => {
        pendingLoad.resolve = resolve
      })
    },
    insertItemTypes: (itemTypes) => {
      storedItemTypes = itemTypes.allIds.map(
        (clientId) => itemTypes.byClientId[clientId],
      )
    },
  })

  const firstRequest = ensureItemTypesLoaded()
  const secondRequest = ensureItemTypesLoaded()

  assert(loadCount === 1, 'concurrent item-type loads should share one request')
  assert(pendingLoad.resolve !== undefined, 'the item-type request should be pending')

  pendingLoad.resolve?.(response)
  const [firstResult, secondResult] = await Promise.all([
    firstRequest,
    secondRequest,
  ])

  assert(firstResult[0] === itemType, 'the first request should return stored item types')
  assert(secondResult[0] === itemType, 'the shared request should return the same item types')

  const cachedResult = await ensureItemTypesLoaded()
  assert(loadCount === 1, 'stored item types should prevent another request')
  assert(cachedResult[0] === itemType, 'the cached request should return stored item types')
}
