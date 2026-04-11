import type { ReactNode } from 'react'

type PlanOrdersPagePayload = {
  planId?: number 
  freshAfter?: string | null
}

type LocalDeliveryOrdersPageProps = {
  payload: PlanOrdersPagePayload
}

export const LocalDeliveryOrdersPage = ({ payload }: LocalDeliveryOrdersPageProps) => {
  const planId = payload?.planId
  if (planId == null) return null

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-4 text-sm text-gray-500">
        Local Delivery Orders - Feature Migration in Progress
      </div>
    </div>
  )
}
