import { useMemo, type UIEvent } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { LocalDeliveryOrderCard } from './cards/LocalDeliveryOrderCard'
import { DraggableLocalDeliveryOrderCard } from './cards/DraggableLocalDeliveryOrderCard'
import { LocalDeliveryBoundaryLocationCard } from './cards/LocalDeliveryBoundaryLocationCard'
import { useLocalDeliveryContext } from '../context/useLocalDeliveryContext'
import { useLocalDeliveryStopOrdering } from '../hooks/useLocalDeliveryStopOrdering'
import { useLocalDeliveryDndProjectionFlow } from '../flows/localDeliveryDndProjection.flow'
import { formatRouteTime } from '@/features/local-delivery-orders/utils/formatRouteTime'
import { BasicButton } from '@/shared/buttons'
import { DeliveryReadyIcon } from '@/assets/icons'
import { buildLocalDeliveryStopAddressGroups } from '../domain/localDeliveryAddressGroup.flow'
import { DraggableLocalDeliveryOrderGroupCard } from './cards/DraggableLocalDeliveryOrderGroupCard'
import { useOrderGroupUIActions, useOrderGroupUIStore } from '@/features/order/store/orderGroupUI.store'
import { useResourceManager } from '@/shared/resource-manager/useResourceManager'
import type { RouteReorderPreview } from '@/features/plan/dnd/controller/resolveDropIntent'




type LocalDeliveryOrderListProps = {
    onScrollContainer?: (event: UIEvent<HTMLDivElement>) => void
    topReservedOffset?: number
}

export const LocalDeliveryOrderList = ({
    onScrollContainer,
    topReservedOffset = 0,
}: LocalDeliveryOrderListProps) => {
    const { routeReorderPreview } = useResourceManager<{ routeReorderPreview?: RouteReorderPreview | null }>()
    const {
        orders,
        planStartDate,
        planState,
        routeSolutionStops,
        stopByOrderId,
        ordersById,
        boundaryLocations,
        selectedRouteSolution,
        routeSolutionWarningRegistry,
        localDeliveryActions
    } = useLocalDeliveryContext()

    const { sortedEntries, missingOrders, sortableIds } = useLocalDeliveryStopOrdering(
        orders,
        routeSolutionStops,
        stopByOrderId,
        ordersById,
    )
    const { projectedStopOrderByClientId } = useLocalDeliveryDndProjectionFlow(
        sortedEntries,
        routeReorderPreview ?? null,
        selectedRouteSolution?.id ?? null,
    )
    const groupedStops = useMemo(
        () => buildLocalDeliveryStopAddressGroups(sortedEntries),
        [sortedEntries],
    )
    const expandedGroupsByKey = useOrderGroupUIStore((state) => state.expandedGroupsByKey)
    const { toggleGroup } = useOrderGroupUIActions()
    const allOrderedStopClientIds = useMemo(
        () => sortedEntries.map((entry) => entry.stop.client_id),
        [sortedEntries],
    )
    const visibleSortableIds = useMemo(() => {
        if (groupedStops.length === 0) return sortableIds

        const visibleIds: string[] = []
        groupedStops.forEach((group) => {
            if (group.entries.length <= 1) {
                const firstClientId = group.entries[0]?.stop.client_id
                if (firstClientId) visibleIds.push(firstClientId)
                return
            }

            visibleIds.push(`route_stop_group:${group.key}`)
        })
        return visibleIds
    }, [groupedStops, sortableIds])

    const strategyLabel = getRouteStrategyLabel(selectedRouteSolution?.route_end_strategy)
    const startLocationLabel = `${strategyLabel} · ${boundaryLocations.start.label}`
    const endLocationLabel = `${strategyLabel} · ${boundaryLocations.end.label}`
   
    return ( 
        <div className="flex h-full min-h-0 flex-col overflow-x-hidden">
            <div
                className="flex-1 min-h-0 overflow-y-auto scroll-thin px-4"
                onScroll={onScrollContainer}
            >

                <div
                    className="flex h-full flex-col gap-4"
                    style={{
                        paddingTop: topReservedOffset ? `${topReservedOffset}px` : undefined,
                        transition: 'padding-top 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    { boundaryLocations.start.location &&
                        <LocalDeliveryBoundaryLocationCard
                            label={startLocationLabel}
                            address={boundaryLocations.start.location}
                            time={formatRouteTime(boundaryLocations.start.time, 'today') }
                            warnings={boundaryLocations.start.warnings}
                            planStartDate={planStartDate}
                            warningRegistry={routeSolutionWarningRegistry}
                            localDeliveryActions={localDeliveryActions}

                        />
                    }
                    <SortableContext items={visibleSortableIds} strategy={verticalListSortingStrategy}>
                        {groupedStops.map((group) => {
                            if (group.entries.length <= 1) {
                                const entry = group.entries[0]
                                if (!entry) return null
                                return (
                                    <DraggableLocalDeliveryOrderCard
                                        key={entry.stop.client_id}
                                        order={entry.order}
                                        stop={entry.stop}
                                        displayStopOrder={projectedStopOrderByClientId?.get(entry.stop.client_id) ?? entry.stop.stop_order ?? null}
                                        planStartDate={planStartDate}
                                        allOrderedStopClientIds={allOrderedStopClientIds}
                                    />
                                )
                            }

                            const uiKey = `local:${group.key}`
                            const expanded = expandedGroupsByKey[uiKey] ?? false

                            return (
                                <DraggableLocalDeliveryOrderGroupCard
                                    key={group.key}
                                    group={group}
                                    expanded={expanded}
                                    onToggleExpanded={() => toggleGroup(uiKey)}
                                    planStartDate={planStartDate}
                                    projectedStopOrderByClientId={projectedStopOrderByClientId}
                                    allOrderedStopClientIds={allOrderedStopClientIds}
                                />
                            )
                        })}
                    </SortableContext>
                    {missingOrders.map((order) => (
                        <LocalDeliveryOrderCard
                            key={order.client_id}
                            order={order}
                            stop={null}
                            planStartDate={planStartDate}
                        />
                    ))}
                    {  boundaryLocations.end.location && groupedStops.length > 0 && 
                        <div className="pb-10">
                            <LocalDeliveryBoundaryLocationCard 
                                label={endLocationLabel}
                                address={boundaryLocations.end.location} 
                                time={ formatRouteTime(boundaryLocations.end.time, 'today') }
                                warnings={boundaryLocations.end.warnings}
                                planStartDate={planStartDate}
                                warningRegistry={routeSolutionWarningRegistry}
                                localDeliveryActions={localDeliveryActions}
                                containerClassName={" mt-4"}
                            />

                         </div>
                    }

                    { planState && planState.name.trim() == 'Open' && sortedEntries.length > 0 && 
                        <div className="pt-8 w-full flex mt-auto pb-10">
                            <BasicButton params={{
                                variant:'primary',
                                className:"w-full py-3.5 rounded-[1.85rem] border border-[rgba(112,222,208,0.22)] shadow-[0_16px_34px_rgba(0,0,0,0.18)]",
                                style:{
                                    background:'linear-gradient(135deg, rgba(31, 175, 193, 0.96), rgba(59, 211, 205, 0.88))',
                                    color:'rgb(13, 31, 34)'
                                },
                                onClick:localDeliveryActions.routeReadyForDelivery
                            }}>
                                <div className="flex gap-4 items-center justify-center">
                                    <DeliveryReadyIcon className="h-5 w-5 text-[rgb(13,31,34)] "/>
                                    <span className="font-medium tracking-tight">
                                        Ready for Delivery
                                    </span>
                                </div>
                            </BasicButton>
                        </div>
                    
                    }
                </div>
            </div>
        </div>
    );
}

const getRouteStrategyLabel = (strategy: string | null | undefined) => {
  if (strategy === 'end_at_last_stop') return 'End at last stop'
  if (strategy === 'custom_end_address') return 'Custom end'
  return 'Round trip'
}
