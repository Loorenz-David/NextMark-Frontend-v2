import type { RouteGroupRouteSummaryStats } from './routeGroupStatsOverlay.types'
import { InlineRouteMetric } from './InlineRouteMetric'

type RouteGroupStatsTopSummaryProps = {
  routeSummary: RouteGroupRouteSummaryStats
  routeScopeKey: string
}

export const RouteGroupStatsTopSummary = ({
  routeSummary,
  routeScopeKey,
}: RouteGroupStatsTopSummaryProps) => (
  <div className="admin-backdrop-blur-md pointer-events-none min-w-[300px] rounded-[28px] border border-white/20 bg-black/28 px-4 py-4">
    <div className="flex flex-col gap-3">
      {routeSummary.rows.map((row, index) => (
        <div key={index} className="grid grid-cols-3 gap-3">
          {row.map((metric) => (
            <InlineRouteMetric
              key={metric.id}
              metric={metric}
              routeScopeKey={routeScopeKey}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)
