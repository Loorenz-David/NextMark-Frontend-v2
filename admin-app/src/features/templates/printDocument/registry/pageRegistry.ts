import type { StackComponentProps } from '@/shared/stack-manager/types'

import { PrintTemplateMainPage } from '../pages/PrintTemplateMainPage'

export type PrintDocumentPageKey = keyof typeof pageRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type PrintDocumentSectionPayloads = {
  [K in keyof typeof pageRegistry]: ExtractPayload<(typeof pageRegistry)[K]>
}

export const pageRegistry = {
  'printDocument.main': PrintTemplateMainPage,
}
