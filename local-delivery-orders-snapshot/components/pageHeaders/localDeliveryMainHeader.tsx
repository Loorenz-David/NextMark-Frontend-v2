import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

import { planIconTypeMap } from "@/features/plan/utils/planIconTypeMap"
import { SectionHeader } from "@/shared/section-panel/SectionHeader"
import { BasicButton } from "@/shared/buttons"
import { CsvIcon, EditIcon, PdfIcon, PlusIcon, RetryIcon } from "@/assets/icons"
import { RouteOptimizationDropdownButton } from "../RouteOptimizationDropdownButton"
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu"
import { OrderImportButton } from "@/features/order/components/OrderImportButton"
import type { OrderImportControls } from "@/features/order/components/OrderImportButton"
import { useLocalDeliveryCommands, useLocalDeliveryState } from '../../context/useLocalDeliveryContext'
import { cn } from '@/lib/utils/cn'
import { formatMetric } from '@shared-utils'

type MainHeaderLocalDeliveryPageProps = {
    useFloatingActionBar?: boolean
    isActionBarVisible?: boolean
    showOptimizeRow?: boolean
}

const actionBarShellClassName =
    'border-b border-[rgba(255,255,255,0.08)] bg-[rgba(14,22,23,0.72)] px-5 pb-4 pt-3 backdrop-blur-[28px] saturate-[125%] supports-[backdrop-filter]:bg-[rgba(14,22,23,0.62)]'

type LocalDeliveryHeaderActionBarProps = {
    showOptimizeRow: boolean
    importControls: OrderImportControls
    onCreateOrder: () => void
    onEditPlan: () => void
    onOptimizeRoute: () => void
    onPrintRoute: () => void
}

const LocalDeliveryHeaderActionBar = ({
    showOptimizeRow,
    importControls,
    onCreateOrder,
    onEditPlan,
    onOptimizeRoute,
    onPrintRoute,
}: LocalDeliveryHeaderActionBarProps) => {
    return (
        <div className={actionBarShellClassName}>
            <div className="flex flex-col gap-3">
                <div className="flex w-full items-center gap-3">
                    <BasicButton
                        params={{
                            variant: 'primary',
                            onClick: onCreateOrder,
                            ariaLabel: 'Create Delivery order',
                        }}
                    >
                        <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
                        Order
                    </BasicButton>
                    <BasicButton
                        params={{
                            variant: 'secondary',
                            onClick: onEditPlan,
                            ariaLabel: 'Edit local delivery plan',
                        }}
                    >
                        <EditIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
                        Edit
                    </BasicButton>

                    <ThreeDotMenu
                        dotWidth={3}
                        dotHeight={3}
                        dotClassName={'bg-[var(--color-muted)]'}
                        triggerClassName={
                            'p-2 w-5 rounded-full bg-[var(--color-page)] border border-[var(--color-border)] shadow-sm ml-auto cursor-pointer'
                        }
                        options={[
                            {label:'Update optimization', action:onOptimizeRoute, icon:<RetryIcon className="h-4 w-4"/>},
                            {label:'Download route', action:onPrintRoute, icon:<PdfIcon className="h-6 w-6"/>},
                            {
                                label: importControls.loading ? 'Importing orders...' : 'Import orders (CSV)',
                                action: importControls.triggerFileInput,
                                icon:<CsvIcon className="h-4 w-4"/>,
                                disabled: importControls.disabled,
                            },
                        ]}
                    />
                </div>

                {showOptimizeRow ? (
                    <div className="flex w-full">
                        <RouteOptimizationDropdownButton className="w-full" />
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export const MainHeaderLocalDeliveryPage = ({
    useFloatingActionBar = false,
    isActionBarVisible = true,
    showOptimizeRow: showOptimizeRowProp,
}: MainHeaderLocalDeliveryPageProps = {})=>{
    const { localDeliveryActions } = useLocalDeliveryCommands()
    const { plan, localDeliveryPlan, orderCount, selectedRouteSolution } = useLocalDeliveryState()


    const [importControls, setImportControls] = useState<OrderImportControls>({
        triggerFileInput: () => undefined,
        loading: false,
        disabled: true,
    })
    const handleImportReady = useCallback((controls: OrderImportControls) => {
        setImportControls(controls)
    }, [])

    const PlanTypeIcon = planIconTypeMap.local_delivery
    const title = plan?.label ?? 'undefined plan'
    const totalVolume = plan?.total_volume ?? 0
    const totalWeight = plan?.total_weight ?? 0

    const hasRouteWarnings = selectedRouteSolution?.has_route_warnings
    const isNotOptimize = selectedRouteSolution?.is_optimized == 'not optimize'
    const isLoading = localDeliveryPlan?.is_loading
    const showOptimizeRow =
        showOptimizeRowProp ??
        Boolean(orderCount > 0 && (isNotOptimize || hasRouteWarnings))
    
    return (
        <>
           
            <SectionHeader
                title={
                     <div className="flex flex-col ">
                        <span>
                            {title}
                        </span>
                        <p className="text-[11px] text-[var(--color-muted)] font-normal">
                            {plan?.total_orders ?? 0 } orders • {plan?.total_items ?? 0 } items • {formatMetric(totalVolume, '㎥')} • {formatMetric(totalWeight, 'kg')}
                        </p>

                    </div>
                }
                icon={<PlanTypeIcon className="h-6 w-6 text-[var(--color-muted)]" />}
                closeButton
                headerButtonsBgClass={
                    useFloatingActionBar && isActionBarVisible
                        ? 'border-b-transparent'
                        : undefined
                }
            />
            {!isLoading 
                ? <motion.div
                    key="header-local-delivery-button"
                    initial={false}
                    animate={{
                        opacity: useFloatingActionBar ? (isActionBarVisible ? 1 : 0) : 1,
                        y: useFloatingActionBar ? (isActionBarVisible ? 0 : -18) : 0,
                    }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        useFloatingActionBar ? 'absolute inset-x-0 top-0 z-20' : 'w-full',
                    )}
                    style={{
                        pointerEvents:
                            !useFloatingActionBar || isActionBarVisible ? 'auto' : 'none',
                    }}
                    >
                        <LocalDeliveryHeaderActionBar
                            showOptimizeRow={showOptimizeRow}
                            importControls={importControls}
                            onCreateOrder={localDeliveryActions.handleCreateOrder}
                            onEditPlan={localDeliveryActions.handleEditLocalPlan}
                            onOptimizeRoute={localDeliveryActions.optimizeRoute}
                            onPrintRoute={localDeliveryActions.handlePrintRouteSolution}
                        />
                    </motion.div>
                : null
            }
            <OrderImportButton planId={plan?.id} onReady={handleImportReady} />
        </>
    )
}
