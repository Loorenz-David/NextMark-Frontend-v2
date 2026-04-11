export type HomeWorkspaceType =
  | 'route-operations'
  | 'store-pickup'
  | 'international-shipping'

export const HOME_WORKSPACE_LABELS: Record<HomeWorkspaceType, string> = {
  'route-operations': 'Route Operations',
  'store-pickup': 'Store Pickup',
  'international-shipping': 'International Shipping',
}

export const HOME_WORKSPACE_OPTIONS: { value: HomeWorkspaceType; label: string }[] = [
  { value: 'route-operations', label: 'Route Operations' },
  { value: 'store-pickup', label: 'Store Pickup' },
  { value: 'international-shipping', label: 'International Shipping' },
]
