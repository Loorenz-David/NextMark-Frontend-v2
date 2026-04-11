import type { Descendant } from 'slate'

import { TemplateEditor } from '@/shared/inputs/TemplateEditor/TemplateEditor'
import { allowedLabels } from '../config/emailLabelConfig'

type EmailHeaderEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

export const EmailHeaderEditor = ({ value, onChange }: EmailHeaderEditorProps) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Header</h3>
    <TemplateEditor
      allowedLabels={allowedLabels}
      value={value}
      onChange={onChange}
      placeholder="Email headline or greeting"
      
      singleLine
    />
  </section>
)
