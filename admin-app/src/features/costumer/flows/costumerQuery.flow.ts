

import { useVisibleCostumers } from '../store/costumer.selectors'
import { selectCostumerListError, selectCostumerListLoading, useCostumerListStore } from '../store/costumerList.store'

import { useCostumerQueries } from '../controllers/costumerQueries.controller'



export const useCostumerQueryFlow = () => {
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
