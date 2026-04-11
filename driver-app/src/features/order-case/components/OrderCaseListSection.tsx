import type { OrderCase } from '../domain'
import { OrderCaseListCard } from './OrderCaseListCard'

type OrderCaseListSectionProps = {
  title: string
  cases: OrderCase[]
  onOpenCase: (orderCaseId: number, orderCaseClientId: string) => void
}

export function OrderCaseListSection({ title, cases, onOpenCase }: OrderCaseListSectionProps) {
  if (cases.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{title}</h3>
      <div className="space-y-3">
        {cases.map((orderCase) => (
          <OrderCaseListCard
            key={orderCase.client_id}
            onOpenCase={onOpenCase}
            orderCase={orderCase}
          />
        ))}
      </div>
    </section>
  )
}
