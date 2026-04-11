import type { LocalDeliveryGaussianMetricCard as LocalDeliveryGaussianMetricCardType } from './LocalDeliveryStatsOverlay.types'
import { GaussianMetricCard } from './GaussianMetricCard'

type LocalDeliveryGaussianMetricsGridProps = {
  cards: LocalDeliveryGaussianMetricCardType[]
  routeScopeKey: string
}

export const LocalDeliveryGaussianMetricsGrid = ({
  cards,
  routeScopeKey,
}: LocalDeliveryGaussianMetricsGridProps) => (
  <div className="grid grid-cols-2 gap-3">
    {cards.map((card) => (
      <GaussianMetricCard key={card.id} card={card} routeScopeKey={routeScopeKey} />
    ))}
  </div>
)
