import { BasicButton } from '@/shared/buttons/BasicButton'
import { InputField } from '@/shared/inputs/InputField'

import type { EmailFooterButton } from '../types'
import { CloseIcon } from '@/assets/icons'

type EmailFooterEditorProps = {
  buttons: EmailFooterButton[]
  onChange: (buttons: EmailFooterButton[]) => void
}

const buildFooterButtonId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `footer-btn-${Date.now()}`

export const EmailFooterEditor = ({ buttons, onChange }: EmailFooterEditorProps) => {
  const addButton = () => {
    onChange([
      ...buttons,
      { id: buildFooterButtonId(), label: '', urlTemplate: '' },
    ])
  }

  const updateButton = (id: string, patch: Partial<EmailFooterButton>) => {
    onChange(buttons.map((button) => (button.id === id ? { ...button, ...patch } : button)))
  }

  const removeButton = (id: string) => {
    onChange(buttons.filter((button) => button.id !== id))
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Footer Buttons</h3>
        <BasicButton
          params={{
            variant: 'primary',
            className: 'px-3 py-1 text-xs',
            onClick: addButton,
            ariaLabel: 'Add footer button',
          }}
        >
          Add button
        </BasicButton>
      </div>

      <div className="flex flex-col gap-3 ">
        {buttons.map((button) => (
          <div
            key={button.id}
            className="flex gap-2 rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-3"
          >
            <InputField
              value={button.label}
              onChange={(event) => updateButton(button.id, { label: event.target.value })}
              placeholder="Button label"
              fieldClassName={"custom-field-container max-w-[150px] "}

            />
            <InputField
              value={button.urlTemplate}
              onChange={(event) => updateButton(button.id, { urlTemplate: event.target.value })}
              placeholder="link URL"
            />
            <div className="flex justify-end">
              <BasicButton
                params={{
                  variant: 'secondary',
                  className: 'px-2  text-md',
                  onClick: () => removeButton(button.id),
                  ariaLabel: 'Remove footer button',
                }}
              >
                <CloseIcon className="w-4 h-4 text-[var(--color-muted)]"/>
              </BasicButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
