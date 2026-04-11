
import type { Order } from '@/features/order/types/order'
import { ItemIcon, TimeIcon } from '@/assets/icons'
import { StateCard } from '@/shared/layout/StateCard'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderStateByServerId } from '@/features/order/store/orderStateHooks.store'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'
import { RouteStopWarnings } from '../warnings/RouteStopWarnings'
import { formatRouteTime } from '@/features/local-delivery-orders/utils/formatRouteTime'
import { useOrderActions } from '@/features/order'
import { LottieSpinner } from '@/shared/spiners'
import { StopOrderAvatar } from './StopOrderAvatar'
import { OrderOperationTypeBadges } from '@/features/order/components/cards/OrderOperationTypeBadges'

type LocalDeliveryOrderCardProps = {
    order: Order;
    stop?: RouteSolutionStop | null;
    displayStopOrder?: number | null;
    planStartDate?: string | null;
}

export const LocalDeliveryOrderCard = ({ order, stop, displayStopOrder, planStartDate }: LocalDeliveryOrderCardProps) => {
    const {openOrderDetail} = useOrderActions()
    const mapManager = useMapManager()
    const orderLabel = order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'
    const streetAddress = order.client_address?.street_address ?? 'No address'
    const expectedArrival = stop && stop.expected_arrival_time !== 'loading'  ? formatRouteTime(stop.expected_arrival_time, planStartDate) : null
    const itemCount = order.total_items ?? 0
    const stopOrder = typeof displayStopOrder === 'number'
        ? displayStopOrder
        : typeof stop?.stop_order == 'number'
            ? stop.stop_order
            : null
    const orderState =  useOrderStateByServerId( order.order_state_id ?? 1 )

    const openOrder = ()=>{
        mapManager.selectOrder(order.client_id)
        openOrderDetail(
            {mode:"edit", clientId:order.client_id},
            { borderLeft:'rgb(var(--color-light-blue-r),0.7)'}
        )
        
    }
    

    return ( 
        <div className="admin-glass-panel admin-surface-compact relative flex flex-col gap-2.5 overflow-hidden rounded-lg border border-white/10 p-4 pl-2 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.08] hover:shadow-[0_16px_38px_rgba(0,0,0,0.16)]"
            onClick={openOrder}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_26%,transparent_72%,rgba(0,0,0,0.04))]" />

            <div className="relative z-10 flex w-full gap-3">
                <StopOrderAvatar stopOrder={stopOrder} />
                <div className="flex min-w-0 flex-col gap-2 flex-1 pl-1">
                        <div className="flex justify-between">
                            <div className="flex min-w-0 gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base font-semibold text-[var(--color-text)]">
                                        {orderLabel}
                                    </span>
                                    <OrderOperationTypeBadges operationType={order.operation_type} />
                                </div>
                                {order.external_source && (
                                <div className="flex items-center justify-center">
                                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                        {order.external_source}
                                    </span>
                                </div>
                                )}
                            </div>
                            { orderState && 
                                <div className="flex gap-3 items-center">
                                    <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
                                    <StateCard label={orderState.name} color={orderState.color ? orderState.color : "#363636ff"}/>
                                </div>
                            }
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <span className="truncate pr-1 text-xs text-[var(--color-muted)]/95">
                                {streetAddress}
                            </span>
                            <div className="flex items-center justify-end gap-3 text-xs text-[var(--color-muted)]">
                                <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
                                    <ItemIcon className="h-3 w-3 text-[var(--color-primary)]/85" />
                                    <span>{itemCount}</span>
                                </div>
                                <div className="flex min-w-[72px] items-center justify-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
                                    { expectedArrival ? 
                                        <>
                                            <TimeIcon className="h-3 w-3 text-[var(--color-light-blue)]" />
                                            <span className="whitespace-nowrap">
                                                    {expectedArrival}
                                            </span>
                                        </>
                                        : streetAddress 
                                            ? <LottieSpinner animation="sandClock" size={50} inline />
                                            : '--'
                                    }
                                </div>
                            </div>
                        </div>
                </div>
            </div>
                

            
        </div>
    );
}
