import type { Descendant } from 'slate'

import {
  TERMS_DOCUMENT_VERSION,
  createEmptyTermsDocument,
  normalizeTermsBlocks,
  type TermsDocument,
} from '@shared-domain'

/**
 * Slate bindings for the shared terms document contract.
 *
 * The contract itself — types, tolerant reader, plain-text and grouping helpers —
 * lives in `@shared-domain` because the public client form renders the same
 * documents and must not depend on this app or on Slate. Only the editor-specific
 * mapping belongs here.
 */

export {
  TERMS_DOCUMENT_VERSION,
  createEmptyTermsDocument,
  isTermsDocumentEmpty,
  termsDocumentFromUnknown,
  termsDocumentToPlainText,
} from '@shared-domain'

export type {
  TermsBlock,
  TermsBlockType,
  TermsDocument,
  TermsSpan,
} from '@shared-domain'

export const termsDocumentToSlate = (document: TermsDocument): Descendant[] => {
  if (!document.blocks.length) {
    return termsDocumentToSlate(createEmptyTermsDocument())
  }

  return document.blocks.map(
    (block) =>
      ({
        type: block.type,
        children: block.spans.length ? block.spans : [{ text: '' }],
      }) as unknown as Descendant,
  )
}

export const slateToTermsDocument = (value: Descendant[]): TermsDocument => ({
  version: TERMS_DOCUMENT_VERSION,
  blocks: normalizeTermsBlocks(value).map((block) => {
    // Slate emits empty boundary leaves; dropping them keeps the stored document
    // clean, but a block that is *entirely* empty is a deliberate blank line.
    const spans = block.spans.filter((span) => span.text.length > 0)
    return { type: block.type, spans: spans.length ? spans : [{ text: '' }] }
  }),
})
