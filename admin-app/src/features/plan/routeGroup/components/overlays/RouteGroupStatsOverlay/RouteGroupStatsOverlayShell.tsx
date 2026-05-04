import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useMapManager } from "@/shared/resource-manager/useResourceManager";
import { ROUTE_GROUP_STATS_OVERLAY_GRADIENT } from "./routeGroupStatsOverlay.constants";
import { RouteGroupConsumptionStatsColumn } from "./RouteGroupConsumptionStatsColumn";
import { RouteGroupDriverCard } from "./RouteGroupDriverCard";
import { RouteGroupGaussianMetricsGrid } from "./RouteGroupGaussianMetricsGrid";
import { RouteGroupStatsTopSummary } from "./RouteGroupStatsTopSummary";
import type {
  RouteGroupStatsLayoutMode,
  RouteGroupStatsOverlayData,
} from "./routeGroupStatsOverlay.types";

const MAP_SAFE_GUTTER = 24

type RouteGroupStatsOverlayShellProps = {
  data: RouteGroupStatsOverlayData;
  hidden: boolean;
  layoutMode: RouteGroupStatsLayoutMode;
  onHide: () => void;
  onShow: () => void;
};

const bodyClassByMode: Record<RouteGroupStatsLayoutMode, string> = {
  wide: "grid min-w-max grid-cols-[minmax(300px,1.25fr)_max-content] items-start gap-4",
  medium: "grid min-w-max grid-cols-[minmax(300px,1.25fr)_max-content] items-start gap-4",
  narrow: "grid min-w-max grid-cols-[minmax(300px,1.25fr)_max-content] items-start gap-4",
};

const useShellMapInsets = (shellRef: React.RefObject<HTMLDivElement | null>, hidden: boolean) => {
  const { storeViewportInsets, reframeToVisibleArea } = useMapManager()
  const rafRef = useRef<number | null>(null)
  const hiddenRef = useRef(hidden)
  const bottomInsetRef = useRef<number | null>(null)
  hiddenRef.current = hidden

  // When the panel closes, start the map animation immediately — concurrent with the
  // panel exit animation — instead of waiting for the panel to fully unmount first.
  useEffect(() => {
    if (!hidden) return
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    bottomInsetRef.current = MAP_SAFE_GUTTER
    storeViewportInsets({
      top: MAP_SAFE_GUTTER,
      right: MAP_SAFE_GUTTER,
      bottom: MAP_SAFE_GUTTER,
      left: MAP_SAFE_GUTTER,
    })
    reframeToVisibleArea()
  }, [hidden, reframeToVisibleArea, storeViewportInsets])

  useEffect(() => {
    const el = shellRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const scheduleReframe = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        reframeToVisibleArea()
      })
    }

    const observer = new ResizeObserver((entries) => {
      if (hiddenRef.current) return
      const height = entries[0]?.contentRect.height ?? 0
      const bottomInset = height + MAP_SAFE_GUTTER
      if (bottomInsetRef.current === bottomInset) return

      bottomInsetRef.current = bottomInset
      storeViewportInsets({
        top: MAP_SAFE_GUTTER,
        right: MAP_SAFE_GUTTER,
        bottom: bottomInset,
        left: MAP_SAFE_GUTTER,
      })
      scheduleReframe()
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      bottomInsetRef.current = MAP_SAFE_GUTTER
      storeViewportInsets({
        top: MAP_SAFE_GUTTER,
        right: MAP_SAFE_GUTTER,
        bottom: MAP_SAFE_GUTTER,
        left: MAP_SAFE_GUTTER,
      })
      reframeToVisibleArea()
    }
  }, [reframeToVisibleArea, storeViewportInsets])
}

export const RouteGroupStatsOverlayShell = ({
  data,
  hidden,
  layoutMode,
  onHide,
  onShow,
}: RouteGroupStatsOverlayShellProps) => {
  const shellRef = useRef<HTMLDivElement | null>(null)
  useShellMapInsets(shellRef, hidden)

  return (
    <div ref={shellRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-[20] flex w-full flex-col justify-end">
      <AnimatePresence mode="wait" initial={false}>
        {hidden ? (
          <motion.div
            key="stats-toggle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none px-4 pb-4"
          >
            <button
              type="button"
              onClick={onShow}
              className="admin-backdrop-blur-md pointer-events-auto rounded-full border border-white/70 bg-black/28 px-4 py-2 text-md font-medium text-white transition-colors hover:bg-white/24"
            >
              Stats
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="stats-panel"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none w-full  pb-4 pt-10"
            style={{ background: ROUTE_GROUP_STATS_OVERLAY_GRADIENT }}
          >
            <div className="flex flex-col gap-4 ">
              <div className="pointer-events-none flex items-start justify-between gap-4 px-4">
                <button
                  type="button"
                  onClick={onHide}
                  className="admin-backdrop-blur-md pointer-events-auto self-start rounded-full border border-white/75 bg-black/28 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/38"
                >
                  Hide
                </button>

                <RouteGroupDriverCard driver={data.driver} />
              </div>

              <div className="pointer-events-auto max-h-[40vh] overflow-x-auto overflow-y-auto scroll-thin">
                <div className="px-4">
                  <div className={bodyClassByMode[layoutMode]}>
                    <div className="flex min-w-0 flex-col flex-nowrap gap-4">
                      <RouteGroupStatsTopSummary
                        routeSummary={data.routeSummary}
                        routeScopeKey={data.routeScopeKey}
                      />
                      <RouteGroupConsumptionStatsColumn
                        metrics={data.consumptionMetrics}
                        routeScopeKey={data.routeScopeKey}
                      />
                    </div>

                    <div className="min-w-max">
                      <RouteGroupGaussianMetricsGrid
                        cards={data.gaussianCards}
                        routeScopeKey={data.routeScopeKey}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
