import type { SVGProps, ComponentType } from 'react'
import { InternationalIcon, RouteIcon, StoreIcon } from '@/assets/icons/index'
import type { RoutePlanObjective } from '@/features/plan/types/plan'

export const routePlanIcon: ComponentType<SVGProps<SVGSVGElement>> = RouteIcon

/**
 * The single place a plan type becomes an icon — plan cards, calendar chips and
 * workspace headers all read it here, so swapping artwork for a type is a
 * one-line change.
 */
export const planIconTypeMap: Record<
  RoutePlanObjective,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  local_delivery: RouteIcon,
  international_shipping: InternationalIcon,
  store_pickup: StoreIcon,
}
