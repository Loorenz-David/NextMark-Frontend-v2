import type { Costumer } from '@/features/costumer'

import { OpeningHoursPreview } from './CostumerOpeningHoursPreview'
import {
  formatCostumerAddress,
  formatCostumerFullName,
  formatCostumerPhone,
} from './CostumerPanel.flows'
import { CostumerPanelDisplayInfo } from './CostumerPanelDisplayInfo'

type CostumerPanelDetailsViewProps = {
  costumer: Costumer
}

export const CostumerPanelDetailsView = ({
  costumer,
}: CostumerPanelDetailsViewProps) => {
  return (
    <div className="flex flex-col pl-4 pr-2 pb-4 ">
      <div className="flex min-w-0 justify-between gap-3 pb-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2 pr-2">
          <CostumerPanelDisplayInfo label="Name:" value={formatCostumerFullName(costumer)} />
          <CostumerPanelDisplayInfo label="Email:" value={costumer.email ?? '-'} />
          <CostumerPanelDisplayInfo label="Phone:" value={formatCostumerPhone(costumer)} />
        </div>
        <div className="flex shrink-0 justify-end self-start">
          {costumer.operating_hours && costumer.operating_hours.length  ? (
            <div className="mr-1 rounded-sm border-1 border-[var(--color-border)] p-2">
              <OpeningHoursPreview costumerOperatingHours={costumer.operating_hours} />
            </div>
          ): null
          }
        </div>
      </div>
      <CostumerPanelDisplayInfo label="Address:" value={formatCostumerAddress(costumer)} />
    </div>
  )
}
