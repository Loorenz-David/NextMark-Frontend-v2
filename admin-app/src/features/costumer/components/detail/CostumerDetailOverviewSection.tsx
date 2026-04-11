import { SlideCarousel } from '@/shared/layout/slideCarousel'

import type { Costumer } from '../../dto/costumer.dto'
import { CostumerDetailInfoSummary } from './CostumerDetailInfoSummary'
import { CostumerDetailOperatingHoursSummary } from './CostumerDetailOperatingHoursSummary'

export const CostumerDetailOverviewSection = ({ costumer }: { costumer: Costumer | null }) => (
  <div className="px-5">
    <SlideCarousel>
      <CostumerDetailInfoSummary costumer={costumer} />
      <CostumerDetailOperatingHoursSummary costumer={costumer} />
    </SlideCarousel>
  </div>
)

