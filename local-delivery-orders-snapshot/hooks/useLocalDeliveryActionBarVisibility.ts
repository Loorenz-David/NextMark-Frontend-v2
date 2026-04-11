import { useScrollHideActionBar } from '@/shared/hooks/useScrollHideActionBar'

type UseLocalDeliveryActionBarVisibilityParams = {
  enabled?: boolean
  expandedHeight: number
  collapsedHeight?: number
}

export const useLocalDeliveryActionBarVisibility = ({
  enabled = true,
  expandedHeight,
  collapsedHeight = 10,
}: UseLocalDeliveryActionBarVisibilityParams) => {
  return useScrollHideActionBar({
    enabled,
    expandedHeight,
    collapsedHeight,
  })
}
