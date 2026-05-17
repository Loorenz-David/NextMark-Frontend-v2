import type { Descendant } from 'slate'

import { normalizeTemplateValue } from '@/features/templates/utils'

import type { EmailFooterButton, EmailTemplateValue } from '../types'

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

const hasText = (node: Descendant): node is Descendant & { children: Array<{ text: string }> } =>
  Array.isArray((node as { children?: unknown }).children)
  && (node as { children: unknown[] }).children.some(
    (child) => isRecord(child) && typeof child.text === 'string' && child.text.trim().length > 0,
  )

const mergeLegacyHeaderIntoBody = (header: Descendant[], body: Descendant[]): Descendant[] => {
  if (!header.some(hasText)) {
    return body
  }

  if (!body.some(hasText)) {
    return header
  }

  return [...header, ...body]
}

export const normalizeEmailTemplateValue = (input?: unknown): EmailTemplateValue => {
  if (Array.isArray(input)) {
    return {
      body: normalizeTemplateValue(input),
      footerButtons: [],
    }
  }

  if (isRecord(input)) {
    const body = normalizeTemplateValue(input.body ?? input.template ?? input.content)
    const legacyHeader = normalizeTemplateValue(input.header)
    const footerButtons = normalizeFooterButtons(input.footerButtons)

    return {
      body: mergeLegacyHeaderIntoBody(legacyHeader, body),
      footerButtons,
    }
  }

  return {
    body: normalizeTemplateValue(input),
    footerButtons: [],
  }
}
