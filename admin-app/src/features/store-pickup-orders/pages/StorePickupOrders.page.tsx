import { StorePickupOrdersProvider } from '../context/StorePickupOrders.provider'
import { useStorePickupPageController } from '../controllers/useStorePickupPageController'
import { StorePickupOrdersPageContent } from './StorePickupOrdersContent.page'

type PlanOrdersPagePayload = {
  planId?: number
  freshAfter?: string | null
}

type StorePickupOrdersPageProps = {
  payload: PlanOrdersPagePayload
  onRequestClose?: () => void
}

export const StorePickupOrdersPage = ({
  payload,
  onRequestClose,
}: StorePickupOrdersPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  return (
    <StorePickupOrdersScreen
      planId={planId}
      freshAfter={payload?.freshAfter ?? null}
      onRequestClose={onRequestClose}
    />
  )
}

type StorePickupOrdersScreenProps = {
  planId: number
  freshAfter: string | null
  onRequestClose?: () => void
}

/**
 * Split from the exported page so the controller's hooks sit below the
 * `planId == null` guard rather than being called conditionally.
 */
const StorePickupOrdersScreen = ({
  planId,
  freshAfter,
  onRequestClose,
}: StorePickupOrdersScreenProps) => {
  const pageModel = useStorePickupPageController({ planId, freshAfter })

  return (
    <StorePickupOrdersProvider value={{ ...pageModel, planId }}>
      <StorePickupOrdersPageContent onRequestClose={onRequestClose} />
    </StorePickupOrdersProvider>
  )
}
