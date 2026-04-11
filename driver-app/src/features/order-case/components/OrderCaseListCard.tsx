import { BoldArrowIcon } from '@/assets/icons'
import type { OrderCase } from '../domain'

type OrderCaseListCardProps = {
  orderCase: OrderCase
  onOpenCase: (orderCaseId: number, orderCaseClientId: string) => void
}

export function OrderCaseListCard({ orderCase, onOpenCase }: OrderCaseListCardProps) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-4 text-left active:scale-[0.995]"
      onClick={() => {
        if (typeof orderCase.id !== 'number') {
          return
        }
        void onOpenCase(orderCase.id, orderCase.client_id)
      }}
      type="button"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{orderCase.label ?? `Case #${orderCase.id ?? orderCase.client_id}`}</p>
        <p className="mt-1 text-xs text-white/55">
          {orderCase.state}
          {orderCase.unseen_chats > 0 ? ` • ${orderCase.unseen_chats} unread` : ''}
        </p>
      </div>

      <BoldArrowIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-white" />
    </button>
  )
}
