import type { Descendant } from 'slate'
import { Editable, Slate } from 'slate-react'
import type { RenderElementProps } from 'slate-react'
import type { BaseEditor } from 'slate'

import type { FocusEvent, KeyboardEvent, JSX } from 'react'

import type { ReactEditor } from 'slate-react'

type SlateEditorProps = {
  editor: BaseEditor & ReactEditor
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  placeholder?: string
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void
  className?: string
}

export const SlateEditor = ({
  editor,
  value,
  onChange,
  renderElement,
  placeholder,
  onKeyDown,
  onFocus,
  className,
}: SlateEditorProps) => (
  <Slate editor={editor} initialValue={value} onChange={onChange}>
    <Editable
      className={`slate-editor min-h-[140px] rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:outline-none ${className ?? ''}`.trim()}
      renderElement={renderElement}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    />
  </Slate>
)
