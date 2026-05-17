import { useMemo, type JSX } from 'react'

import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor, RenderElementProps } from 'slate-react'

import { SlateEditor } from '@/shared/inputs/TemplateEditor/SlateEditor'

type EmailSubjectEditorProps = {
  editor: BaseEditor & ReactEditor
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  onFocus: () => void
}

export const EmailSubjectEditor = ({
  editor,
  value,
  onChange,
  renderElement,
  onFocus,
}: EmailSubjectEditorProps) => {
  const editorClassName = useMemo(
    () =>
      "w-full !min-h-[56px] !rounded-[18px] !border !border-black/[0.10] !bg-white/[0.05] !px-4 !py-3 text-base font-semibold text-[var(--color-text)] !shadow-none transition placeholder:text-[var(--color-muted)]/70 focus:!border-[#67cfc9]/55 focus:!bg-white/[0.05] focus:!shadow-[0_0_0_3px_rgba(103,207,201,0.12)] [&>*]:w-full [&_[data-slate-node='element']]:my-0",
    [],
  )

  return (
    <section className="flex flex-col gap-2">
      <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        Subject
      </label>
      <SlateEditor
        key={JSON.stringify(value)}
        editor={editor}
        value={value}
        onChange={onChange}
        renderElement={renderElement}
        placeholder="Email subject"
        onFocus={onFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        className={editorClassName}
      />
    </section>
  )
}
