import type { JSX, KeyboardEvent } from 'react'
import type { Descendant } from 'slate'
import { SlateEditor } from '@/shared/inputs/TemplateEditor/SlateEditor'
import type { RenderElementProps } from 'slate-react'
import type { BaseEditor } from 'slate'
import type { ReactEditor } from 'slate-react'

type SmsPhonePreviewProps = {
  editor: BaseEditor & ReactEditor
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  placeholder: string
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

export const SmsPhonePreview = ({
  editor,
  value,
  onChange,
  renderElement,
  placeholder,
  onKeyDown,
}: SmsPhonePreviewProps) => {
  return (
    <div className="admin-glass-panel-strong rounded-3xl bg-[linear-gradient(180deg,rgba(var(--theme-surface-shell-mid-r),0.98),rgba(var(--theme-surface-shell-deep-r),0.98))] p-5 shadow-none">
      <div className="mx-auto flex max-w-[360px] flex-col rounded-4xl border border-border-subtle bg-[linear-gradient(180deg,rgba(var(--theme-surface-shell-solid-r),1),rgba(var(--theme-surface-shell-deep-r),1))] p-4 shadow-[var(--shadow-panel-phone)]">
        <div className="mx-auto mb-3 h-1.5 w-24 rounded-full bg-surface-hover" />

        <div className="rounded-3xl border border-border-subtle bg-[radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-primary)_4%,transparent),transparent_44%),linear-gradient(180deg,rgba(var(--theme-surface-message-r),0.98),rgba(var(--theme-surface-shell-solid-r),0.98))] p-4">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised text-sm font-semibold text-[#9be9d7]">
              CL
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">Client conversation</p>
              <p className="text-xs text-faint">SMS preview</p>
            </div>
          </div>

          <div className="flex min-h-[430px] flex-col justify-end gap-4 pt-5">
            <div className="max-w-[72%] rounded-3xl rounded-bl-md border border-border-subtle bg-surface-raised px-4 py-3 text-sm leading-6 text-muted">
              We will send this message when the selected trigger runs.
            </div>

            <div className="ml-auto w-[82%] rounded-3xl rounded-br-md border border-[#83ccb9]/20 bg-[linear-gradient(145deg,var(--sms-preview-bubble-start),rgba(67,118,123,0.8))] p-3 text-text shadow-[var(--shadow-panel-subtle-color)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">
                  Live message
                </span>
                <span className="text-[0.68rem] font-medium text-faint">Sent SMS</span>
              </div>
              <SlateEditor
                key={JSON.stringify(value)}
                editor={editor}
                value={value}
                onChange={onChange}
                renderElement={renderElement}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                className="min-h-[120px] border-0 bg-transparent px-0 py-0 text-[15px] leading-7 text-text shadow-none placeholder:text-faint"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
