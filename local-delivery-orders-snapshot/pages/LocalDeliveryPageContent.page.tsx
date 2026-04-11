
import { LocalDeliveryOrderList, MainHeaderLocalDeliveryPage } from '../components'
import { OptimizationLoading } from '../components/spinners/Optimization.spinner'
import { MIN_LOADER_VISIBLE_MS } from '../constants/optimization.constants'
import { useLocalDeliveryContext } from '../context/useLocalDeliveryContext'
import { useLocalDeliveryActionBarVisibility } from '../hooks/useLocalDeliveryActionBarVisibility'

const ACTION_BAR_HEIGHT_WITH_OPTIMIZE = 138
const ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE = 82
const ACTION_BAR_COLLAPSED_HEIGHT = 12


export const LocalDeliveryPageContent = () => {
  const { orderCount, localDeliveryPlan, selectedRouteSolution } = useLocalDeliveryContext()

  const isLoading = localDeliveryPlan?.is_loading
  const optimizationStartedAt = localDeliveryPlan?.optimization_started_at ?? null
  const showOptimizeRow =
    !isLoading &&
    orderCount > 0 &&
    (selectedRouteSolution?.is_optimized === 'not optimize' ||
      selectedRouteSolution?.has_route_warnings === true)

  const {
    isActionBarVisible,
    actionBarReservedHeight,
    isDesktopActionBarBehaviorEnabled,
    handleScroll,
  } = useLocalDeliveryActionBarVisibility({
    enabled: !isLoading,
    expandedHeight: showOptimizeRow
      ? ACTION_BAR_HEIGHT_WITH_OPTIMIZE
      : ACTION_BAR_HEIGHT_WITHOUT_OPTIMIZE,
    collapsedHeight: ACTION_BAR_COLLAPSED_HEIGHT,
  })

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--color-primary)]/5">
      <MainHeaderLocalDeliveryPage
        useFloatingActionBar={isDesktopActionBarBehaviorEnabled}
        isActionBarVisible={isActionBarVisible}
        showOptimizeRow={showOptimizeRow}
      />
     
      {!isLoading 
        ? (
          <LocalDeliveryOrderList
            onScrollContainer={handleScroll}
            topReservedOffset={
              isDesktopActionBarBehaviorEnabled ? actionBarReservedHeight : 0
            }
          />
        )
        : isLoading == 'isOptimizing' 
          ? <OptimizationLoading message={
            <>
              <p className="font-semibold text-[var(--color-muted)]">
                Optimization in progress
              </p>
              <p className="text-sm opacity-70">
                You can come back when it is ready.
              </p>
            </>
          } startedAt={optimizationStartedAt} orderCount={orderCount} minDurationMs={MIN_LOADER_VISIBLE_MS} />
          : null
      }

    </div>
  )
}
