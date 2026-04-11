import type { ReactNode } from 'react'

type StorePickupOrdersPageContentProps = {
  // Page content props will be defined here as feature develops
}

export const StorePickupOrdersPageContent = ({}: StorePickupOrdersPageContentProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Store Pickup Orders</p>
        <p className="text-sm text-gray-500">Feature implementation in progress</p>
      </div>
    </div>
  )
}
