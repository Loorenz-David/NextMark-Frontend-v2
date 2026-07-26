import { loadItemTypes } from '../actions/loadItemTypes.query'
import {
  insertItemTypes,
  selectAllItemTypes,
  useItemTypeStore,
} from '../store/itemTypeStore'
import { createEnsureItemTypesLoadedFlow } from './ensureItemTypesLoaded.factory'

export const ensureItemTypesLoaded = createEnsureItemTypesLoadedFlow({
  getStoredItemTypes: () =>
    selectAllItemTypes(useItemTypeStore.getState()),
  loadItemTypes,
  insertItemTypes,
})
