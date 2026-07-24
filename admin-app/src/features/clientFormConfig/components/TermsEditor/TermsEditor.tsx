import { useMemo } from 'react'
import type { KeyboardEvent } from 'react'

import { createEditor, type Descendant } from 'slate'
import { withReact } from 'slate-react'

import { SlateEditor } from '@/shared/inputs/TemplateEditor/SlateEditor'

import type { TermsBlockType } from '../../domain/termsDocument'
import {
  isBlockActive,
  isMarkActive,
  setBlockType,
  toggleMark,
  type TermsEditorInstance,
  type TermsMark,
} from './termsEditor.commands'
import { renderTermsElement, renderTermsLeaf } from './termsEditor.render'

const BLOCK_OPTIONS: { type: TermsBlockType; label: string }[] = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'heading', label: 'Heading' },
  { type: 'bullet', label: 'Bullet' },
]

const MARK_OPTIONS: { mark: TermsMark; label: string; className: string }[] = [
  { mark: 'bold', label: 'B', className: 'font-bold' },
  { mark: 'italic', label: 'I', className: 'italic' },
]

const toolbarButtonClass = (isActive: boolean) =>
  `rounded-full border px-3 py-1 text-xs transition-colors ${
    isActive
      ? 'border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.14)] text-[rgb(var(--color-light-blue-r))]'
      : 'border-border bg-surface-raised text-[var(--color-muted)] hover:text-[var(--color-text)]'
  }`

type TermsEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  /** Bump to reseed the editor — Slate reads `initialValue` only on mount. */
  editorKey: number
}

const TermsEditorInstanceView = ({ value, onChange }: Omit<TermsEditorProps, 'editorKey'>) => {
  const editor = useMemo(() => withReact(createEditor()) as TermsEditorInstance, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!event.metaKey && !event.ctrlKey) {
      return
    }
    if (event.key === 'b') {
      event.preventDefault()
      toggleMark(editor, 'bold')
    }
    if (event.key === 'i') {
      event.preventDefault()
      toggleMark(editor, 'italic')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {BLOCK_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            // Keeps focus in the editor so the transform applies to the selection.
            onMouseDown={(event) => {
              event.preventDefault()
              setBlockType(editor, option.type)
            }}
            className={toolbarButtonClass(isBlockActive(editor, option.type))}
          >
            {option.label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-surface-hover" />
        {MARK_OPTIONS.map((option) => (
          <button
            key={option.mark}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              toggleMark(editor, option.mark)
            }}
            className={`${toolbarButtonClass(isMarkActive(editor, option.mark))} ${option.className}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <SlateEditor
        editor={editor}
        value={value}
        onChange={onChange}
        renderElement={renderTermsElement}
        renderLeaf={renderTermsLeaf}
        onKeyDown={handleKeyDown}
        placeholder="Write the terms your customers accept when they submit the form…"
        className="min-h-[320px] leading-6"
      />
    </div>
  )
}

export const TermsEditor = ({ value, onChange, editorKey }: TermsEditorProps) => (
  <TermsEditorInstanceView key={editorKey} value={value} onChange={onChange} />
)
