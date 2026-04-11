import type { Descendant } from 'slate'

export type EmailFooterButton = {
  id: string
  label: string
  urlTemplate: string
}

export type EmailTemplateValue = {
  header: Descendant[]
  body: Descendant[]
  footerButtons: EmailFooterButton[]
}

export type EmailTemplatePreviewPayload = EmailTemplateValue & {
  mockData?: Record<string, unknown>
}
