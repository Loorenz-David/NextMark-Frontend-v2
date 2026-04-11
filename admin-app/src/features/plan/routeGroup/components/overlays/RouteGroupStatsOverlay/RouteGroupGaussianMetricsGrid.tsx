import type { RouteGroupGaussianMetricCard as RouteGroupGaussianMetricCardType } from './routeGroupStatsOverlay.types'
import { GaussianMetricCard } from './GaussianMetricCard'

type RouteGroupGaussianMetricsGridProps = {
  cards: RouteGroupGaussianMetricCardType[]
  routeScopeKey: string
}

export const RouteGroupGaussianMetricsGrid = ({
  cards,
  routeScopeKey,
}: RouteGroupGaussianMetricsGridProps) => (
  <div className="grid grid-cols-2 gap-3">
    {cards.map((card) => (
      <GaussianMetricCard key={card.id} card={card} routeScopeKey={routeScopeKey} />
    ))}
  </div>
)
