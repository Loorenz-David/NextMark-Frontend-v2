import { useCallback, useEffect } from "react"
import type { Order } from '@/features/order/types/order'
import { selectCostumerByServerId, useCostumerByServerId, type Costumer } from "@/features/costumer"
import { useCostumerQueries } from "@/features/costumer/controllers/costumerQueries.controller"

type Props = {
    order:Order | null
    setSelectedCostumer: (value:Costumer | null) => void
}

export const useCostumerFromOrderFlow = ({
    order,
    setSelectedCostumer
}:Props)=>{
    const costumer = useCostumerByServerId(order?.costumer_id ?? null)
    const { getCostumer } = useCostumerQueries()

    
  useEffect(() => {
    if (!order?.costumer_id) {
      return
    }

    if (costumer) {
      setSelectedCostumer(costumer)
      return
    }

    let cancelled = false

    const load = async () => {
        if (!order?.costumer_id) return
        const fetched = await getCostumer(order.costumer_id)
    
        if (!cancelled) {
            setSelectedCostumer(fetched)
        }
    }

    load()

    return () => {
      cancelled = true
    }

  }, [order?.costumer_id,  getCostumer, setSelectedCostumer])

}