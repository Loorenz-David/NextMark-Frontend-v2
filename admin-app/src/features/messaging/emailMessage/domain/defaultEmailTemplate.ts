import { normalizeTemplateValue } from '@/features/templates/utils'
import type { EmailTemplateValue } from '../types'

const createDefaultEmailTemplate = (): EmailTemplateValue => ({
  header: normalizeTemplateValue(undefined),
  body: normalizeTemplateValue(undefined),
  footerButtons: [],
})

export const DEFAULT_EMAIL_TEMPLATE = createDefaultEmailTemplate()
