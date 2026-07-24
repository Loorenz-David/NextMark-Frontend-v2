import { Editor, Element as SlateElement, Transforms } from 'slate'
import type { BaseEditor } from 'slate'
import type { ReactEditor } from 'slate-react'

import type { TermsBlockType } from '../../domain/termsDocument'

export type TermsEditorInstance = BaseEditor & ReactEditor

export type TermsMark = 'bold' | 'italic'

/**
 * The repository declares no Slate `CustomTypes`, so `Element` and `Text` carry
 * no `type` / mark fields. The casts below are the standard consequence of that
 * and are confined to this module — the persisted shape is validated by
 * `slateToTermsDocument` regardless of what the editor holds.
 */

const readBlockType = (node: unknown): string | null => {
  if (typeof node !== 'object' || node === null) {
    return null
  }
  const type = (node as { type?: unknown }).type
  return typeof type === 'string' ? type : null
}

export const isMarkActive = (editor: TermsEditorInstance, mark: TermsMark): boolean => {
  const marks = Editor.marks(editor) as Record<string, unknown> | null
  return marks?.[mark] === true
}

export const toggleMark = (editor: TermsEditorInstance, mark: TermsMark) => {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark)
    return
  }
  Editor.addMark(editor, mark, true)
}

export const isBlockActive = (editor: TermsEditorInstance, type: TermsBlockType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) && SlateElement.isElement(node) && readBlockType(node) === type,
  })
  return Boolean(match)
}

export const setBlockType = (editor: TermsEditorInstance, type: TermsBlockType) => {
  Transforms.setNodes(editor, { type } as unknown as Partial<SlateElement>, {
    match: (node) => !Editor.isEditor(node) && SlateElement.isElement(node),
  })
}
