export { costumerApi } from './api/costumerApi'
export { useCostumerController } from './controllers/costumerMutations.controller'
export { useCostumerQueries } from './controllers/costumerQueries.controller'
export { CostumerSearchBar } from './components'
export type { CostumerSearchBarProps } from './components'
export { CostumerFormEmbedded } from './forms/costumerForm/CostumerFormEmbedded'
export {
  runCostumerQueryFlow,
} from './flows/costumerQuery.flow'
export { normalizeCostumerPayload } from './domain/normalizeCostumerPayload'
export {
  costumerPopupRegistry,
} from './registry/costumerPopups.registry'
export type {
  CostumerPopupKey,
  CostumerPopupPayloads,
} from './registry/costumerPopups.registry'

export type {
  Costumer,
  CostumerAddress,
  CostumerPhone,
  CostumerOperatingHours,
  CostumerMap,
  CostumerStats,
  CostumerPagination,
  CostumerQueryFilters,
  CostumerCreateFields,
  CostumerCreatePayload,
  CostumerUpdateFields,
  CostumerUpdateTargetPayload,
  CostumerDeletePayload,
  CostumerListResponse,
  CostumerDetailResponse,
  CostumerCreateResponse,
  CostumerUpdateResponse,
  CostumerDeleteResponse,
} from './dto/costumer.dto'

export {
  useCostumerStore,
  clearCostumers,
} from './store/costumer.store'

export {
  useCostumers,
  useVisibleCostumers,
  useCostumerByClientId,
  useCostumerByServerId,
  selectAllCostumers,
  selectVisibleCostumers,
  selectCostumerByClientId,
  selectCostumerByServerId,
} from './store/costumer.selectors'

export {
  patchCostumerByClientId,
  patchCostumersByClientIds,
  setVisibleCostumerIds,
} from './store/costumer.patchers'

export {
  setCostumer,
  setCostumers,
  upsertCostumer,
  upsertCostumers,
  updateCostumerByClientId,
  removeCostumerByClientId,
} from './store/costumer.upserters'

export {
  useCostumerListStore,
  selectCostumerListStats,
  selectCostumerListPagination,
  selectCostumerListQuery,
  selectCostumerListLoading,
  selectCostumerListError,
  setCostumerListResult,
  setCostumerListLoading,
  setCostumerListError,
  clearCostumerList,
} from './store/costumerList.store'

export {
  useCostumerDetailUIStore,
  useCostumerOrdersLoading,
  setLoadingOrders,
} from './store/costumerDetailUI.store'
