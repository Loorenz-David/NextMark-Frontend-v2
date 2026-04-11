import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemMainPage } from '../pages/ItemMainPage'

export type ItemPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type ItemSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'item.main': ItemMainPage,
}
