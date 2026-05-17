import type { Descendant } from 'slate'

import { normalizeTemplateValue } from '@/features/templates/utils'
import type { TemplateLabelElement } from '@/shared/inputs/TemplateEditor/renderElement'

const SUBJECT_LABEL_TOKEN_PATTERN = /\{\{([a-zA-Z0-9_-]+)\}\}/g

const createSubjectParagraph = (children: Array<{ text: string } | TemplateLabelElement>): Descendant =>
  ({
    type: 'paragraph',
    children: children.length > 0 ? children : [{ text: '' }],
  }) as Descendant

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLabelElement = (value: unknown): value is TemplateLabelElement =>
  isRecord(value) && value.type === 'label' && typeof value.labelKey === 'string'

const nodeHasContent = (node: unknown): boolean => {
  if (isLabelElement(node)) {
    return true
  }

  if (isRecord(node) && typeof node.text === 'string') {
    return node.text.trim().length > 0
  }

  if (isRecord(node) && Array.isArray(node.children)) {
    return node.children.some(nodeHasContent)
  }

  return false
}

const parseStringSubjectTemplate = (subject: string): Descendant[] => {
  const children: Array<{ text: string } | TemplateLabelElement> = []
  let cursor = 0

  for (const match of subject.matchAll(SUBJECT_LABEL_TOKEN_PATTERN)) {
    const tokenStart = match.index ?? 0
    const labelKey = match[1]

    if (tokenStart > cursor) {
      children.push({ text: subject.slice(cursor, tokenStart) })
    }

    children.push({
      type: 'label',
      labelKey,
      children: [{ text: '' }],
    })

    cursor = tokenStart + match[0].length
  }

  if (cursor < subject.length) {
    children.push({ text: subject.slice(cursor) })
  }

  return [createSubjectParagraph(children)]
}

export const normalizeEmailSubjectTemplateValue = (subject?: unknown): Descendant[] => {
  if (typeof subject === 'string') {
    return parseStringSubjectTemplate(subject)
  }

  if (Array.isArray(subject) || isRecord(subject)) {
    return normalizeTemplateValue(subject)
  }

  return normalizeTemplateValue(undefined)
}

export const hasEmailSubjectTemplateContent = (subject: Descendant[]): boolean =>
  subject.some(nodeHasContent)
