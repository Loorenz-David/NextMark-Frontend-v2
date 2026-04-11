import type { ReactNode } from 'react'

import type { DesktopPlanViewMode } from '../hooks/useHomeDesktopLayout'
import { MapArea } from './MapArea'
import { OverlayRail } from './OverlayRail'
import { PlanArea } from './PlanArea'

interface HomeDesktopLayoutProps {
  map: ReactNode
  mapOverlay?: ReactNode
  plan?: ReactNode
  base: ReactNode
  overlay: ReactNode
  orderOverlay?: ReactNode
  buttonTogglePlan?: ReactNode
  baseWidth: number
  isOrderOverlayOpen: boolean
  isPlanVisible: boolean
  viewMode: DesktopPlanViewMode
  splitMode: boolean
  planColumnWidth: number
  mapRowHeight: number
  planRowHeight: number
  orderOverlayWidth: number
  overlayWidth: number
  hasOverlay: boolean
  onPlanLayoutChange?: () => void
  onRailTransitionEnd?: () => void
}

export function HomeDesktopLayout({
  map,
  mapOverlay,
  plan,
  base,
  overlay,
  orderOverlay,
  buttonTogglePlan,
  baseWidth,
  isOrderOverlayOpen,
  isPlanVisible,
  viewMode,
  splitMode,
  planColumnWidth,
  mapRowHeight,
  planRowHeight,
  orderOverlayWidth,
  overlayWidth,
  hasOverlay,
  onPlanLayoutChange,
  onRailTransitionEnd,
}: HomeDesktopLayoutProps) {
  const planColumnGridWidth = splitMode ? 0 : planColumnWidth
  const railColumnWidth = isOrderOverlayOpen ? orderOverlayWidth : baseWidth

  return (
    <main
      className="grid h-full min-h-0 flex-1 overflow-hidden layout-animate"
      style={{
        gridTemplateColumns: `minmax(0, 1fr) ${planColumnGridWidth}px ${railColumnWidth}px`,
        willChange: 'grid-template-columns',
        transition: 'grid-template-columns 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName !== 'grid-template-columns') return
        onRailTransitionEnd?.()
      }}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <div
          className={splitMode ? 'relative min-h-0 shrink-0 layout-animate' : 'relative min-h-0 flex-1'}
          style={
            splitMode
              ? {
                  height: `${mapRowHeight}%`,
                  willChange: 'height',
                  transition: 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : { height: '100%' }
          }
          onTransitionEnd={(event) => {
            if (!splitMode) return
            if (event.propertyName !== 'height') return
            onRailTransitionEnd?.()
          }}
        >
          <MapArea map={map} mapOverlay={mapOverlay} />
        </div>

        {splitMode ? (
          <PlanArea
            viewMode={viewMode}
            isPlanVisible={isPlanVisible}
            plan={plan}
            buttonTogglePlan={buttonTogglePlan}
            planColumnWidth={planColumnWidth}
            planRowHeight={planRowHeight}
            onPlanLayoutChange={onPlanLayoutChange}
            onRailTransitionEnd={onRailTransitionEnd}
          />
        ) : null}
      </div>

      {!splitMode ? (
        <PlanArea
          viewMode={viewMode}
          isPlanVisible={isPlanVisible}
          plan={plan}
          buttonTogglePlan={buttonTogglePlan}
          planColumnWidth={planColumnWidth}
          planRowHeight={planRowHeight}
          onPlanLayoutChange={onPlanLayoutChange}
          onRailTransitionEnd={onRailTransitionEnd}
        />
      ) : null}

      <OverlayRail
        baseWidth={baseWidth}
        base={base}
        overlay={overlay}
        orderOverlay={orderOverlay}
        isOrderOverlayOpen={isOrderOverlayOpen}
        hasOverlay={hasOverlay}
        orderOverlayWidth={orderOverlayWidth}
        overlayWidth={overlayWidth}
        onPlanLayoutChange={onPlanLayoutChange}
      />
    </main>
  )
}
