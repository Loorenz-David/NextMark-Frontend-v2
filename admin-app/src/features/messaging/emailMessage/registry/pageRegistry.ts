import type { StackComponentProps } from '@/shared/stack-manager/types'

import { EmailMessageMainPage } from '../pages/EmailMessageMainPage'

export type EmailMessagePageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type EmailMessageSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'emailMessage.main': EmailMessageMainPage,
}
