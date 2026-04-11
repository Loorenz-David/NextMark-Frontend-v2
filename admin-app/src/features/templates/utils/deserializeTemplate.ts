import type { Descendant } from 'slate'

const createDefaultTemplateValue = (): Descendant[] => [
  ({
    type: 'paragraph',
    children: [{ text: '' }],
  } as unknown as Descendant),
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasText = (value: unknown): value is { text: string } =>
  isRecord(value) && typeof value.text === 'string'

const normalizeTopLevelNode = (node: unknown): Descendant | null => {
  if (!isRecord(node)) {
    return null
  }

  if (typeof node.type === 'string' && Array.isArray(node.children)) {
    return node as unknown as Descendant
  }

  if (hasText(node)) {
    return {
      type: 'paragraph',
      children: [{ text: node.text }],
    } as Descendant
  }

  return null
}

const normalizeDescendantArray = (value: unknown): Descendant[] | null => {
  if (!Array.isArray(value)) {
    return null
  }

  const normalized = value
    .map(normalizeTopLevelNode)
    .filter((node): node is Descendant => node !== null)

  return normalized.length > 0 ? normalized : null
}

export const deserializeTemplate = (serialized?: string | null) => {
  if (!serialized) {
    return createDefaultTemplateValue()
  }

  try {
    const parsed = JSON.parse(serialized) as unknown
    const normalized = normalizeDescendantArray(parsed)
    if (normalized) {
      return normalized
    }
  } catch {
    return createDefaultTemplateValue()
  }

  return createDefaultTemplateValue()
}

export const normalizeTemplateValue = (input?: unknown) => {
  if (!input) {
    return createDefaultTemplateValue()
  }

  if (typeof input === 'string') {
    return deserializeTemplate(input)
  }

  if (Array.isArray(input)) {
    return normalizeDescendantArray(input) ?? createDefaultTemplateValue()
  }

  if (typeof input === 'object') {
    return deserializeTemplate(JSON.stringify(input))
  }

  return createDefaultTemplateValue()
}
