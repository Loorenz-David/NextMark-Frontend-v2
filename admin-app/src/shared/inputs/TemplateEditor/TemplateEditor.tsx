import { useMemo } from 'react'

import type { Descendant } from 'slate'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'

import { LabelPicker } from '../LabelPicker/LabelPicker'
import type { LabelDefinition } from '../LabelPicker/labelTypes'

import { createRenderElement } from './renderElement'
import { SlateEditor } from './SlateEditor'
import { insertLabel, withLabels } from './withLabels'

type TemplateEditorProps = {
  allowedLabels: LabelDefinition[]
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  placeholder?: string
  singleLine?: boolean
}

export const TemplateEditor = ({
  allowedLabels,
  value,
  onChange,
  placeholder,
  singleLine = false,
}: TemplateEditorProps) => {
  const editor = useMemo(() => withLabels(withReact(createEditor())), [])
  const labelLookup = useMemo(
    () => Object.fromEntries(allowedLabels.map((label) => [label.id, label.displayName])),
    [allowedLabels],
  )
  const renderElement = useMemo(() => createRenderElement(labelLookup), [labelLookup])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Labels</p>
        <LabelPicker
          labels={allowedLabels}
          onSelect={(label) => insertLabel(editor, label.id)}
        />
      </div>
      <SlateEditor
        key={JSON.stringify(value)} // Reset editor state when value changes externally
        editor={editor}
        value={value}
        onChange={onChange}
        renderElement={renderElement}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (singleLine && event.key === 'Enter') {
            event.preventDefault()
          }
        }}
      />
    </div>
  )
}
