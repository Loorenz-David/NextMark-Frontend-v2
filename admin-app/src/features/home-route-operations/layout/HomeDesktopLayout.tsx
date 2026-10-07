import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

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
  buttonToggleMap?: ReactNode
  baseWidth: number
  isOrderOverlayOpen: boolean
  isPlanVisible: boolean
  isMapVisible: boolean
  viewMode: DesktopPlanViewMode
  splitMode: boolean
  planColumnWidth: number | string
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
  buttonToggleMap,
  baseWidth,
  isOrderOverlayOpen,
  isPlanVisible,
  isMapVisible,
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
  const planColumnGridCss =
    typeof planColumnGridWidth === 'number'
      ? `${planColumnGridWidth}px`
      : planColumnGridWidth
  const railColumnWidth = isOrderOverlayOpen ? orderOverlayWidth : baseWidth

  return (
    <main
      className="relative grid h-full min-h-0 flex-1 overflow-hidden layout-animate"
      style={{
        gridTemplateColumns: `minmax(0, 1fr) ${planColumnGridCss} ${railColumnWidth}px`,
        willChange: 'grid-template-columns',
        transition: 'grid-template-columns 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName !== 'grid-template-columns') return
        onRailTransitionEnd?.()
      }}
    >
      <div
        className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
        aria-hidden={!isMapVisible}
        inert={!isMapVisible}
      >
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
          <MapArea
            map={map}
            mapOverlay={mapOverlay}
            buttonToggleMap={isMapVisible ? buttonToggleMap : null}
          />
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

      {!isMapVisible && buttonToggleMap ? (
        <motion.div
          className="absolute left-0 top-0 z-30"
          initial={{ x: -150 }}
          animate={{ x: 0 }}
          exit={{ x: -150 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {buttonToggleMap}
        </motion.div>
      ) : null}
    </main>
  )
}
