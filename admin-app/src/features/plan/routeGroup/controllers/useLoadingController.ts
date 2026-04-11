

import { useRouteGroupStore } from "../store/routeGroup.slice"


type Props ={
    routeGroupClientId?: string
}

export const useLoadingController = ({
    routeGroupClientId
}:Props)=>{

    const handleOptimizationLoader = (loading:boolean)=>{
        if (!routeGroupClientId) return
        const routeGroupState = useRouteGroupStore.getState()
        const routeGroup = routeGroupState.byClientId[routeGroupClientId]
        if (!routeGroup) return

        if (loading) {
            routeGroupState.patch(routeGroupClientId, {
                is_loading: 'isOptimizing',
                optimization_started_at: routeGroup.optimization_started_at ?? Date.now(),
            })
            return
        }

        routeGroupState.patch(routeGroupClientId, {
            is_loading: undefined,
            optimization_started_at: null,
        })
        
    }

    return {
        handleOptimizationLoader,

    }
}
