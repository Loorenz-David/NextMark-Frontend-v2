import { useMemo } from 'react'
import type { Descendant } from 'slate'
import { createEditor, Transforms } from 'slate'
import { withReact } from 'slate-react'

import { createRenderElement } from '@/shared/inputs/TemplateEditor/renderElement'
import { insertLabel, withLabels } from '@/shared/inputs/TemplateEditor/withLabels'
import { allowedLabels } from '../config/smsLabelConfig'
import { SmsPhonePreview } from './SmsPhonePreview'
import { SmsLabelsPanel } from './SmsLabelsPanel'

type SmsTemplateEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

export const SmsTemplateEditor = ({ value, onChange }: SmsTemplateEditorProps) => {
  const editor = useMemo(() => withLabels(withReact(createEditor())), [])
  const labelLookup = useMemo(
    () => Object.fromEntries(allowedLabels.map((label) => [label.id, label.displayName])),
    [],
  )
  const renderElement = useMemo(() => createRenderElement(labelLookup), [labelLookup])

  return (
    <section className="admin-glass-panel-strong rounded-3xl p-6 shadow-none">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          SMS content
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          Write the real message inside the phone preview. Use labels from the side panel to insert
          dynamic client and delivery details. Press Enter for a new line or Tab to indent text.
        </p>
      </div>

      <div className="mb-5 rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(var(--theme-surface-editor-top-r),0.8),var(--glass-overlay))] px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text)]">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-1.5 text-[0.7rem] font-semibold text-[var(--accent-ink)]">
              1
            </span>
            <span>Write inside the live message bubble</span>
            <span className="px-1 text-faint">→</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-1.5 text-[0.7rem] font-semibold text-[var(--accent-ink)]">
              2
            </span>
            <span>Tap a label to insert it at the current cursor</span>
          </div>

          <p className="max-w-[420px] text-xs leading-5 text-[var(--color-muted)] xl:text-right">
            The labels panel edits the same message you see on the left, so each click updates the
            real SMS content immediately.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <SmsPhonePreview
          editor={editor}
          value={value}
          onChange={onChange}
          renderElement={renderElement}
          placeholder="Write your SMS template..."
          onKeyDown={(event) => {
            if (event.key === 'Tab') {
              event.preventDefault()
              Transforms.insertText(editor, '\t')
            }
          }}
        />

        <SmsLabelsPanel
          labels={allowedLabels}
          onSelect={(label) => insertLabel(editor, label.id)}
        />
      </div>
    </section>
  )
}
