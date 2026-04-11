import type { StackComponentProps } from '@/shared/stack-manager/types'

import { CostumerDetailHeader } from '../components/pageHeaders/CostumerDetailHeader'
import { CostumerDetailOverviewSection } from '../components/detail/CostumerDetailOverviewSection'
import { CostumerDetailOrdersSection } from '../components/detail/CostumerDetailOrdersSection'
import { CostumerDetailProvider } from '../context/CostumerDetailProvider'
import { useCostumerDetailContext } from '../context/CostumerDetailContext'

export type CostumerDetailPayload = {
  clientId?: string
  serverId?: number
  mode?: 'view' | 'edit'
}

const CostumerDetailPageBody = () => {
  const { costumer, closeCostumerDetail, openCostumerEditForm } = useCostumerDetailContext()

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin border-l-1 border-l-[var(--color-primary)]/30 bg-[var(--color-page)]">
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-thin border-l-1 border-l-[var(--color-primary)]/30 bg-[var(--color-muted)]/10">
        <CostumerDetailHeader
          onClose={closeCostumerDetail}
          onEdit={costumer?.client_id ? () => openCostumerEditForm(costumer.client_id) : undefined}
        />

        <div className="flex h-full min-h-0 flex-1 flex-col gap-4 bg-[var(--color-page)] pb-3 pt-1">
          <CostumerDetailOverviewSection costumer={costumer} />
          <div className="flex min-h-0 flex-1 px-5">
            <CostumerDetailOrdersSection />
          </div>
        </div>
      </div>
    </div>
  )
}

export const CostumerDetailPage = ({ payload, onClose }: StackComponentProps<CostumerDetailPayload>) => (
  <CostumerDetailProvider payload={payload} onClose={onClose}>
    <CostumerDetailPageBody />
  </CostumerDetailProvider>
)
