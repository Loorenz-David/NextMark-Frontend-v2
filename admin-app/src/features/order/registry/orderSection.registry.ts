import { createElement } from 'react'
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { OrderMainPage } from '../pages/orderMain.page'
import { OrderDetailPage } from '../pages/orderDetail.page'
import { OrderPage } from '../pages/order.page'

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

const LegacySection = (_: StackComponentProps<{ clientId?: string; mode?: string }>) =>
  createElement(OrderMainPage)

export const pageRegistry = {
  'order.main': OrderMainPage,
  'order.details': OrderDetailPage,
  'orderCases.main': LegacySection,
  'oderCase.details':LegacySection,
  OrderPage,
}

export type PageKey = keyof typeof pageRegistry

export type OrderPagePayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}
