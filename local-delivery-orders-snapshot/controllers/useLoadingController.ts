

import { useLocalDeliveryPlanStore } from "../store/localDelivery.slice"


type Props ={
    localDeliveryClientId?: string
}

export const useLoadingController = ({
    localDeliveryClientId
}:Props)=>{

    const handleOptimizationLoader = (loading:boolean)=>{
        if (!localDeliveryClientId) return
        const localDeliveryState = useLocalDeliveryPlanStore.getState()
        const localPlan = localDeliveryState.byClientId[localDeliveryClientId]
        if (!localPlan) return

        if (loading) {
            localDeliveryState.patch(localDeliveryClientId, {
                is_loading: 'isOptimizing',
                optimization_started_at: localPlan.optimization_started_at ?? Date.now(),
            })
            return
        }

        localDeliveryState.patch(localDeliveryClientId, {
            is_loading: undefined,
            optimization_started_at: null,
        })
        
    }

    return {
        handleOptimizationLoader,

    }
}
