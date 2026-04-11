import type { StackComponentProps } from '@/shared/stack-manager/types'

import { SmsMessageMainPage } from '../pages/SmsMessageMainPage'

export type SmsMessagePageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type SmsMessageSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'smsMessage.main': SmsMessageMainPage,
}
