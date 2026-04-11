import type { StackComponentProps } from '@/shared/stack-manager/types'

import { OrderCaseList } from '@/features/orderCase/components/OrderCaseList'
import { CaseOrderProvider } from '@/features/orderCase/context/order/caseOrder.provider'
import { OrderCaseOrderCasesHeader } from '@/features/orderCase/components/pageHeaders/OrderCaseOrderCasesHeader'

import { useCaseOrderContext } from '../../context/order/caseOrder.context'

type OrderCaseOrderCasesPayload = {
  orderId: number
  orderReference: string
}

const CaseOrderPageContent = ({ orderId, orderReference }: { orderId: number; orderReference?: string }) => {
  const { caseOrderActions, cases, casesStats } = useCaseOrderContext()

  return (
    <div className="flex h-full w-full flex-col border-l-1 border-l-[var(--color-primary)]/30 bg-[var(--color-page)]">
      <OrderCaseOrderCasesHeader
        orderCaseStats={casesStats}
        onClose={caseOrderActions.closeCaseOrder}
        onCreateCase={() => {
          caseOrderActions.createOpenCase(orderId)
        }}
      />

      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-5 pt-3">
        <OrderCaseList
          cases={cases}
          onOpenCase={caseOrderActions.openCaseDetails}
          onDeleteCase={(orderCaseId) => {
            caseOrderActions.removeCase(orderCaseId)
          }}
        />
      </div>
    </div>
  )
}

export const CaseOrderPage = ({ payload, onClose }: StackComponentProps<OrderCaseOrderCasesPayload>) => {
  const orderId = payload?.orderId
  const orderReference = payload?.orderReference

  if (!orderId) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted)]">
        Missing order id.
      </div>
    )
  }

  return (
    <CaseOrderProvider orderId={orderId} onClose={onClose}>
      <CaseOrderPageContent orderId={orderId} orderReference={orderReference} />
    </CaseOrderProvider>
  )
}
