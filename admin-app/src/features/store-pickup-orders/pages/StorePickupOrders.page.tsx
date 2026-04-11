type PlanOrdersPagePayload = {
  planId?: number 
  freshAfter?: string | null
}

type StorePickupOrdersPageProps = {
  payload: PlanOrdersPagePayload
}

export const StorePickupOrdersPage = ({ payload }: StorePickupOrdersPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-4 text-sm text-gray-500">
        Store Pickup Orders - Coming Soon
      </div>
    </div>
  )
}
