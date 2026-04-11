import type { SVGProps, ComponentType } from 'react'
import { RouteIcon } from '@/assets/icons/index'

export const routePlanIcon: ComponentType<SVGProps<SVGSVGElement>> = RouteIcon
export const planIconTypeMap = {
  local_delivery: RouteIcon,
} as const
