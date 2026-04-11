import { selectOrderByServerId, updateOrderByClientId, useOrderStore } from "../store/order.store"



export const useOrderForCase = ( )=>{

    const changeOrderOpenCasesCount = (orderId:number, step:number) =>{

        const state = useOrderStore.getState()
        const order = selectOrderByServerId(orderId)(state)
        if (!order || typeof order.open_order_cases !== 'number') return false
        
        updateOrderByClientId(order.client_id, (existing)=>({
                ...existing,
                open_order_cases: Math.max(
                    (existing.open_order_cases ?? 0) + step,
                    0
                )
            })
        )
        return true
    }

    return{
        changeOrderOpenCasesCount
    }
}