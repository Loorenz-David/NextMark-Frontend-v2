import type { StackComponentProps } from '@/shared/stack-manager/types'

import { UserMainPage } from '../pages/UserMainPage'

export type PageKey = keyof typeof pageRegistry

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export type UserPagePayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'user.main': UserMainPage,
}
