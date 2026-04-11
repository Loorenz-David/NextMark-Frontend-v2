import { ApiError } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

import type {
  CostumerQueryFilters,
} from '../dto/costumer.dto'

import { useVisibleCostumers } from '../store/costumer.selectors'
import { selectCostumerListError, selectCostumerListLoading, useCostumerListStore } from '../store/costumerList.store'

import { useCostumerQueries } from '../controllers/costumerQueries.controller'



export const runCostumerQueryFlow = () => {
  const visibleCostumers = useVisibleCostumers()
  const isLoading = useCostumerListStore(selectCostumerListLoading)
  const error = useCostumerListStore(selectCostumerListError)
  const { queryCostumers } = useCostumerQueries()
  


  return {
    queryCostumers,
    visibleCostumers,
    isLoading,
    error
  }
}
