import { useEffect, useState } from "react"
import { shouldRunCostumerQuery } from "../components/CostumerSearchBar"
import { setCostumerListError, setCostumerListLoading } from "../store/costumerList.store"
import { setVisibleCostumerIds } from "../store/costumer.patchers"
import type { CostumerMap, CostumerQueryFilters } from "../dto/costumer.dto"


export const buildCostumerSearchQuery = (input: string, limit: number) => ({
  q: input.trim(),
  limit,
})

type Props ={
    initialQuery?: string
    debounceMs?: number,
    limit?: number
    queryCostumers: (query?: CostumerQueryFilters )=> Promise<CostumerMap | null>
}

export const useCostumerSearch = ({
    initialQuery = '',
    debounceMs=200,
    limit=10,
    queryCostumers
}:Props) =>{
    const [searchInput, setSearchInput] = useState(initialQuery)

     useEffect(() => {
        const trimmedInput = searchInput.trim()
    
        if (!shouldRunCostumerQuery(trimmedInput)) {
          setCostumerListError(undefined)
          setCostumerListLoading(false)
          setVisibleCostumerIds([])
          return
        }
    
        const timeoutId = window.setTimeout(async () => {
          await queryCostumers(buildCostumerSearchQuery(trimmedInput, limit))
        }, debounceMs)
    
        return () => {
          window.clearTimeout(timeoutId)
        }
      }, [searchInput, debounceMs, limit, queryCostumers])

    return {
        searchInput,
        setSearchInput
    }
    
}