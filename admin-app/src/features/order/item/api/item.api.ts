import { createItemsApi } from '@shared-api'
import type { Item, ItemMap } from '@shared-domain'
import { apiClient } from '@/lib/api/ApiClient'

export type {
  ItemBatchListQuery,
  ItemBatchListResponse,
  ItemCreateResponse,
  ItemDeletePayload,
  ItemIdPagination,
  ItemListResponse,
  ItemMutationResponse,
  ItemUpdatePayload,
} from '@shared-api'

const itemsApi = createItemsApi(apiClient)

export const {
  getOrderItems,
  getItemsByOrderIds,
  createItem,
  updateItem,
  deleteItem,
} = itemsApi

export const useGetOrderItems = () => getOrderItems
export const useGetItemsByOrderIds = () => getItemsByOrderIds
export const useCreateItem = () => createItem
export const useUpdateItem = () => updateItem
export const useDeleteItem = () => deleteItem

export type { Item, ItemMap }
