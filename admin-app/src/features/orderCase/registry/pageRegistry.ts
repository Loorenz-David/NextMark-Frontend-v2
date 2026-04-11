import type { ComponentType } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'

import { CaseDetailsPage } from '../pages/details/CaseDetailsPage'
import { CaseMainPage } from '../pages/main/CaseMainPage'
import { CaseOrderPage } from '../pages/order/CaseOrderPage'

type ExtractPayload<T> = T extends ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export const pageRegistry = {
  'orderCase.main': CaseMainPage,
  'orderCase.orderCases': CaseOrderPage,
  'orderCase.details': CaseDetailsPage,
}

export type OrderCasePageKey = keyof typeof pageRegistry

export type OrderCasePagePayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}
