import { InternationalShippingOrdersProvider } from '../context/InternationalShippingOrders.provider'
import { useInternationalShippingPageController } from '../controllers/useInternationalShippingPageController'
import { InternationalShippingOrdersPageContent } from './InternationalShippingOrdersContent.page'

type PlanOrdersPagePayload = {
  planId?: number
  freshAfter?: string | null
}

type InternationalShippingOrdersPageProps = {
  payload: PlanOrdersPagePayload
  onRequestClose?: () => void
}

export const InternationalShippingOrdersPage = ({
  payload,
  onRequestClose,
}: InternationalShippingOrdersPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  return (
    <InternationalShippingOrdersScreen
      planId={planId}
      freshAfter={payload?.freshAfter ?? null}
      onRequestClose={onRequestClose}
    />
  )
}

type InternationalShippingOrdersScreenProps = {
  planId: number
  freshAfter: string | null
  onRequestClose?: () => void
}

/**
 * Split from the exported page so the controller's hooks sit below the
 * `planId == null` guard rather than being called conditionally.
 */
const InternationalShippingOrdersScreen = ({
  planId,
  freshAfter,
  onRequestClose,
}: InternationalShippingOrdersScreenProps) => {
  const pageModel = useInternationalShippingPageController({
    planId,
    freshAfter,
  })

  return (
    <InternationalShippingOrdersProvider value={{ ...pageModel, planId }}>
      <InternationalShippingOrdersPageContent onRequestClose={onRequestClose} />
    </InternationalShippingOrdersProvider>
  )
}
