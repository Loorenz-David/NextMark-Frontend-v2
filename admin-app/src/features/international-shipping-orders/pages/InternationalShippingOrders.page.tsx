import { InternationalShippingOrdersProvider } from '../context/InternationalShippingOrders.provider'
import { InternationalShippingOrdersPageContent } from './InternationalShippingOrdersContent.page'

type PlanOrdersPagePayload = {
  planId?: number 
  freshAfter?: string | null
}

type InternationalShippingOrdersPageProps = {
  payload: PlanOrdersPagePayload
}

export const InternationalShippingOrdersPage = ({ payload }: InternationalShippingOrdersPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  return (
    <InternationalShippingOrdersProvider planId={planId}>
      <InternationalShippingOrdersPageContent />
    </InternationalShippingOrdersProvider>
  )
}
