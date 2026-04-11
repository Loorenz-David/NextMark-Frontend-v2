import { AnimatePresence, motion } from "framer-motion";

import { ROUTE_GROUP_STATS_OVERLAY_GRADIENT } from "./routeGroupStatsOverlay.constants";
import { RouteGroupConsumptionStatsColumn } from "./RouteGroupConsumptionStatsColumn";
import { RouteGroupDriverCard } from "./RouteGroupDriverCard";
import { RouteGroupGaussianMetricsGrid } from "./RouteGroupGaussianMetricsGrid";
import { RouteGroupStatsTopSummary } from "./RouteGroupStatsTopSummary";
import type {
  RouteGroupStatsLayoutMode,
  RouteGroupStatsOverlayData,
} from "./routeGroupStatsOverlay.types";

type RouteGroupStatsOverlayShellProps = {
  data: RouteGroupStatsOverlayData;
  hidden: boolean;
  layoutMode: RouteGroupStatsLayoutMode;
  onHide: () => void;
  onShow: () => void;
};

const bodyClassByMode: Record<RouteGroupStatsLayoutMode, string> = {
  wide: "grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-4",
  medium: "grid grid-cols-1 items-start gap-4",
  narrow: "flex flex-col gap-4",
};

export const RouteGroupStatsOverlayShell = ({
  data,
  hidden,
  layoutMode,
  onHide,
  onShow,
}: RouteGroupStatsOverlayShellProps) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[20] flex w-full flex-col justify-end">
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
            className="pointer-events-auto rounded-full border border-white/70 bg-black/28 px-4 py-2 text-md font-medium text-white backdrop-blur-md transition-colors hover:bg-white/24"
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
                className="pointer-events-auto self-start rounded-full border border-white/75 bg-black/28 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/38"
              >
                Hide
              </button>

              <RouteGroupDriverCard driver={data.driver} />
            </div>

            <div className="pointer-events-auto max-h-[40vh] overflow-y-auto scroll-thin">
              <div className="px-4">
                <div className={bodyClassByMode[layoutMode]}>
                  <div className="flex min-w-0 flex-col gap-4 flex-wrap">
                    <RouteGroupStatsTopSummary
                      routeSummary={data.routeSummary}
                      routeScopeKey={data.routeScopeKey}
                    />
                    <RouteGroupConsumptionStatsColumn
                      metrics={data.consumptionMetrics}
                      routeScopeKey={data.routeScopeKey}
                    />
                  </div>

                  <div className="min-w-0">
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
);
