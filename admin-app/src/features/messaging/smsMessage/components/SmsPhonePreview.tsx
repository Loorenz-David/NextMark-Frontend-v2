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
    <div className="admin-glass-panel-strong rounded-[28px] bg-[linear-gradient(180deg,rgba(10,17,18,0.98),rgba(8,14,15,0.98))] p-5 shadow-none">
      <div className="mx-auto flex max-w-[360px] flex-col rounded-[36px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(11,18,19,1),rgba(8,14,15,1))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <div className="mx-auto mb-3 h-1.5 w-24 rounded-full bg-white/10" />

        <div className="rounded-[24px] border border-white/[0.05] bg-[radial-gradient(circle_at_bottom_right,rgba(131,204,185,0.04),transparent_44%),linear-gradient(180deg,rgba(16,26,27,0.98),rgba(11,18,19,0.98))] p-4">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-sm font-semibold text-[#9be9d7]">
              CL
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/92">Client conversation</p>
              <p className="text-xs text-white/42">SMS preview</p>
            </div>
          </div>

          <div className="flex min-h-[430px] flex-col justify-end gap-4 pt-5">
            <div className="max-w-[72%] rounded-[20px] rounded-bl-md border border-white/[0.05] bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/64">
              We will send this message when the selected trigger runs.
            </div>

            <div className="ml-auto w-[82%] rounded-[22px] rounded-br-md border border-[#83ccb9]/20 bg-[linear-gradient(145deg,rgba(92,168,163,0.74),rgba(67,118,123,0.8))] p-3 text-white shadow-[0_8px_18px_rgba(56,103,108,0.08)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Live message
                </span>
                <span className="text-[0.68rem] font-medium text-white/42">Sent SMS</span>
              </div>
              <SlateEditor
                key={JSON.stringify(value)}
                editor={editor}
                value={value}
                onChange={onChange}
                renderElement={renderElement}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                className="min-h-[120px] border-0 bg-transparent px-0 py-0 text-[15px] leading-7 text-white/92 shadow-none placeholder:text-white/40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
