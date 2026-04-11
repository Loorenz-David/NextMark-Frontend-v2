import { useEffect, useMemo, useState } from 'react'

import type { Descendant } from 'slate'

import { normalizeTemplateValue, serializeTemplate } from '@/features/templates/utils'
import type { EmailFooterButton, EmailTemplateValue } from '../types'

const createEmptySection = (): Descendant[] => normalizeTemplateValue(undefined)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFooterButton = (value: unknown): value is EmailFooterButton => {
  if (!isRecord(value)) {
    return false
  }
  return (
    typeof value.id === 'string'
    && typeof value.label === 'string'
    && typeof value.urlTemplate === 'string'
  )
}

const normalizeFooterButtons = (value: unknown): EmailFooterButton[] =>
  Array.isArray(value) ? value.filter(isFooterButton) : []

const normalizeEmailTemplateValue = (input?: unknown): EmailTemplateValue => {
  if (Array.isArray(input)) {
    return {
      header: createEmptySection(),
      body: normalizeTemplateValue(input),
      footerButtons: [],
    }
  }

  if (isRecord(input)) {
    const header = normalizeTemplateValue(input.header)
    const body = normalizeTemplateValue(input.body ?? input.template ?? input.content)
    const footerButtons = normalizeFooterButtons(input.footerButtons)

    return { header, body, footerButtons }
  }

  return {
    header: createEmptySection(),
    body: normalizeTemplateValue(input),
    footerButtons: [],
  }
}

export const useEmailMessageEditor = (initialTemplate?: unknown) => {
  
  const [value, setValue] = useState<EmailTemplateValue>(() => normalizeEmailTemplateValue(initialTemplate))
  const serialized = useMemo(() => serializeTemplate(value), [value])

  useEffect(() => {
    setValue(normalizeEmailTemplateValue(initialTemplate))
  }, [initialTemplate])

  return { value, setValue, serialized }
}
