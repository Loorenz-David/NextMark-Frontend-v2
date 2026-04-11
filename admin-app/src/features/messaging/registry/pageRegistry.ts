import type { StackComponentProps } from '@/shared/stack-manager/types'

import { MessagesMainPage } from '../pages/MessagesMainPage'

export type MessagesPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type MessagesSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'messages.main': MessagesMainPage,
}
