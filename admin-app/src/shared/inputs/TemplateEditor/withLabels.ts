import type { Editor } from 'slate'
import { Transforms, Editor as SlateEditor } from 'slate'

import type { TemplateLabelElement } from './renderElement'

export const withLabels = <T extends Editor>(editor: T) => {
  const { isInline, isVoid } = editor

  editor.isInline = (element) =>
    'type' in element && element.type === 'label' ? true : isInline(element)

  editor.isVoid = (element) =>
    'type' in element && element.type === 'label' ? true : isVoid(element)

  return editor
}

export const insertLabel = (editor: Editor, labelKey: string) => {
  if (!editor.selection) {
    const end = SlateEditor.end(editor, [])
    Transforms.select(editor, end)
  }

  const labelNode: TemplateLabelElement = {
    type: 'label',
    labelKey,
    children: [{ text: '' }],
  }

  Transforms.insertNodes(editor, labelNode)
  Transforms.move(editor)
}
