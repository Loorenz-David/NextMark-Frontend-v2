import type { Descendant } from 'slate'

export type EmailFooterButton = {
  id: string
  label: string
  urlTemplate: string
}

export type EmailTemplateValue = {
  body: Descendant[]
  footerButtons: EmailFooterButton[]
}

export type EmailTemplatePreviewPayload = EmailTemplateValue & {
  subject?: Descendant[]
  mockData?: Record<string, unknown>
}
