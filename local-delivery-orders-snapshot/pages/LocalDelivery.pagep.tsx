import { LocalDeliveryRouteGroupRail, type LocalDeliveryRouteGroupItem } from '../components'
import { LocalDeliveryProvider } from '../context/LocalDelivery.provider'
import { LocalDeliveryPageContent } from './LocalDeliveryPageContent.page'

type PlanOrdersPagePayload = {
  planId?: number
  freshAfter?: string | null
}

type RouteGroupsPageProps = {
  payload: PlanOrdersPagePayload
}

const MOCK_ROUTE_GROUPS: LocalDeliveryRouteGroupItem[] = [
  { route_group_id: 1, label: 'Route 1' },
  { route_group_id: 2, label: 'Route 2' },
  { route_group_id: 3, label: 'Route 3' },
  { route_group_id: 4, label: 'Route 4' },
]

type LocalDeliveryPageLayoutProps = {
  routeGroups: LocalDeliveryRouteGroupItem[]
  onRouteGroupClick: (item: LocalDeliveryRouteGroupItem) => void
}

export const LocalDeliveryPageLayout = ({
  routeGroups,
  onRouteGroupClick,
}: LocalDeliveryPageLayoutProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5 md:flex-row">
      <div className="border-b border-white/8 md:h-full md:border-b-0 md:border-r md:border-white/8">
        <LocalDeliveryRouteGroupRail
          items={routeGroups}
          onClick={onRouteGroupClick}
        />
      </div>
      <div className="min-h-0 flex-1">
        <LocalDeliveryPageContent />
      </div>
    </div>
  )
}

export const RouteGroupsPage = ({ payload }: RouteGroupsPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  const handleRouteGroupClick = (_item: LocalDeliveryRouteGroupItem) => undefined

  return (
    <LocalDeliveryProvider planId={planId}>
      <LocalDeliveryPageLayout
        routeGroups={MOCK_ROUTE_GROUPS}
        onRouteGroupClick={handleRouteGroupClick}
      />
    </LocalDeliveryProvider>
  )
}
