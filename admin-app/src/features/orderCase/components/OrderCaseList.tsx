

import type { OrderCase } from '../types'
import { OrderCaseCard } from './OrderCaseCard'

type OrderCaseListProps = {
  cases: OrderCase[]
  onOpenCase: (orderCaseClientId: string) => void
  onDeleteCase?: (orderCaseId: string) => void
}

export const OrderCaseList = ({ cases, onOpenCase, onDeleteCase }: OrderCaseListProps) => {
  if (!cases.length) {
    return (
      <div className="admin-glass-panel rounded-[24px] border-white/10 px-4 py-5 text-sm text-[var(--color-muted)]" style={{ boxShadow: 'none' }}>
        No cases yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {cases.map((orderCase) => (
        <OrderCaseCard
          key={orderCase.client_id}
          orderCase={orderCase}
          onOpenCase={onOpenCase}
          onDeleteCase={onDeleteCase}
          
        />
      ))}
    </div>
  )
}
