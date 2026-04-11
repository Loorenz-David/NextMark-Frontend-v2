import type { LocalDeliveryRouteSummaryStats } from './LocalDeliveryStatsOverlay.types'
import { InlineRouteMetric } from './InlineRouteMetric'

type LocalDeliveryStatsTopSummaryProps = {
  routeSummary: LocalDeliveryRouteSummaryStats
  routeScopeKey: string
}

export const LocalDeliveryStatsTopSummary = ({
  routeSummary,
  routeScopeKey,
}: LocalDeliveryStatsTopSummaryProps) => (
  <div className="pointer-events-none min-w-[300px] rounded-[28px] border border-white/20 bg-black/28 px-4 py-4 backdrop-blur-md ">
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
