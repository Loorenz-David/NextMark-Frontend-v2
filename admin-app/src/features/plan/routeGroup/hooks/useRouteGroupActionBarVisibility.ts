import { useScrollHideActionBar } from '@/shared/hooks/useScrollHideActionBar'

type UseRouteGroupActionBarVisibilityParams = {
  enabled?: boolean
  expandedHeight: number
}

export const useRouteGroupActionBarVisibility = ({
  enabled = true,
  expandedHeight,
}: UseRouteGroupActionBarVisibilityParams) => {
  return useScrollHideActionBar({
    enabled,
    expandedHeight,
  })
}
