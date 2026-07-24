/**
 * Persisted shape of a client-form terms & conditions version.
 *
 * The backend stores `content` verbatim and never inspects it, so this module is
 * the single definition of that contract. It lives in a shared package because
 * two apps depend on it and must never drift: the admin app authors it with a
 * Slate editor, and the public client form renders it without knowing Slate
 * exists. It is therefore deliberately editor-agnostic and framework-free.
 */

export const TERMS_DOCUMENT_VERSION = 1

export type TermsBlockType = 'paragraph' | 'heading' | 'bullet'

/**
 * A run of text with uniform formatting. Slate splits a line into one leaf per
 * mark change, so a single block commonly holds several spans.
 */
export type TermsSpan = {
  text: string
  bold?: boolean
  italic?: boolean
}

export type TermsBlock = {
  type: TermsBlockType
  spans: TermsSpan[]
}

export type TermsDocument = {
  version: number
  blocks: TermsBlock[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Tolerates the shorthand block names a hand-written or legacy document may use. */
const normalizeBlockType = (value: unknown): TermsBlockType => {
  switch (value) {
    case 'heading':
    case 'h':
    case 'h1':
    case 'h2':
      return 'heading'
    case 'bullet':
    case 'li':
    case 'list-item':
    case 'bulleted-list-item':
      return 'bullet'
    default:
      return 'paragraph'
  }
}

const normalizeSpan = (value: unknown): TermsSpan | null => {
  if (!isRecord(value) || typeof value.text !== 'string') {
    return null
  }

  const span: TermsSpan = { text: value.text }
  if (value.bold === true) {
    span.bold = true
  }
  if (value.italic === true) {
    span.italic = true
  }
  return span
}

const normalizeSpans = (value: unknown): TermsSpan[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map(normalizeSpan).filter((span): span is TermsSpan => span !== null)
}

const normalizeBlock = (value: unknown): TermsBlock | null => {
  if (!isRecord(value)) {
    return null
  }

  const type = normalizeBlockType(value.type)

  // Canonical shape.
  const spans = normalizeSpans(value.spans)
  if (spans.length) {
    return { type, spans }
  }

  // Slate node — leaves live under `children`.
  const children = normalizeSpans(value.children)
  if (children.length) {
    return { type, spans: children }
  }

  // Flat `{ type, text }` shorthand.
  if (typeof value.text === 'string') {
    return { type, spans: [{ text: value.text }] }
  }

  // A deliberately blank line.
  return { type, spans: [{ text: '' }] }
}

/** Exported for the admin editor's Slate mappers; renderers should use `termsDocumentFromUnknown`. */
export const normalizeTermsBlocks = (value: unknown): TermsBlock[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map(normalizeBlock).filter((block): block is TermsBlock => block !== null)
}

export const createEmptyTermsDocument = (): TermsDocument => ({
  version: TERMS_DOCUMENT_VERSION,
  blocks: [{ type: 'paragraph', spans: [{ text: '' }] }],
})

/**
 * Reads whatever the backend returned into a canonical document. Accepts the
 * canonical object, a bare block array, and a raw Slate value — a team may have
 * published terms before the canonical shape existed.
 */
export const termsDocumentFromUnknown = (input: unknown): TermsDocument => {
  if (Array.isArray(input)) {
    const blocks = normalizeTermsBlocks(input)
    return blocks.length ? { version: TERMS_DOCUMENT_VERSION, blocks } : createEmptyTermsDocument()
  }

  if (isRecord(input)) {
    const blocks = normalizeTermsBlocks(input.blocks)
    if (blocks.length) {
      return {
        version: typeof input.version === 'number' ? input.version : TERMS_DOCUMENT_VERSION,
        blocks,
      }
    }
  }

  return createEmptyTermsDocument()
}

export const termsDocumentToPlainText = (document: TermsDocument): string =>
  document.blocks.map((block) => block.spans.map((span) => span.text).join('')).join('\n')

export const isTermsDocumentEmpty = (document: TermsDocument): boolean =>
  termsDocumentToPlainText(document).trim().length === 0

export const isBlankTermsBlock = (block: TermsBlock): boolean =>
  block.spans.every((span) => span.text.trim().length === 0)

/**
 * A renderable view of the document. Consecutive `bullet` blocks collapse into a
 * single list node so a renderer emits one `<ul>` around them rather than one
 * per item — the block stream carries no nesting of its own.
 */
export type TermsRenderNode =
  | { kind: 'list'; blocks: TermsBlock[] }
  | { kind: 'block'; block: TermsBlock }

export const groupTermsBlocks = (document: TermsDocument): TermsRenderNode[] => {
  const nodes: TermsRenderNode[] = []

  for (const block of document.blocks) {
    if (block.type !== 'bullet') {
      nodes.push({ kind: 'block', block })
      continue
    }

    const previous = nodes[nodes.length - 1]
    if (previous?.kind === 'list') {
      previous.blocks.push(block)
      continue
    }

    nodes.push({ kind: 'list', blocks: [block] })
  }

  return nodes
}
