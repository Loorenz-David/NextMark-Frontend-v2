import type { ReactNode } from 'react'
import { InternationalShippingOrdersProvider } from '../context/InternationalShippingOrders.provider'

type PlanOrdersPagePayload = {
  planId?: number 
  freshAfter?: string | null
}

type InternationalShippingOrdersPageContentProps = {
  // Page content props will be defined here as feature develops
}

export const InternationalShippingOrdersPageContent = ({}: InternationalShippingOrdersPageContentProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">International Shipping Orders</p>
        <p className="text-sm text-gray-500">Feature implementation in progress</p>
      </div>
    </div>
  )
}
