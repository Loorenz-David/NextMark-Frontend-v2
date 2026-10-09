import { useMemo } from 'react'

import { resolveClientFormRedirect } from '@client-form-kit'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useClientFormRedirectForm } from './ClientFormRedirectForm.context'
import { useClientFormRedirectFormConfig } from './useClientFormRedirectFormConfig'
import { useClientFormRedirectFormSetters } from './useClientFormRedirectFormSetters'

export const ClientFormRedirectFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } =
    useClientFormRedirectForm()

  const setters = useClientFormRedirectFormSetters({ setFormState, warnings })

  useClientFormRedirectFormConfig({ formState, initialFormRef, payload })

  const resolved = resolveClientFormRedirect(formState.url)

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Add' : 'Save', action: handleSave },
      ...(payload.mode === 'edit' ? { deleteButton: { label: 'Delete', action: handleDelete } } : {}),
    }),
    [handleSave, handleDelete, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 pb-[40px] scroll-thin">
        <Field label="Name:" required={true} info="Only shown here, to tell your pages apart.">
          <InputField
            value={formState.label}
            onChange={(event) => setters.handleLabel(event.target.value)}
            warningController={warnings.labelWarning}
          />
        </Field>
        {warnings.labelWarning.warning.isVisible && (
          <InputWarning {...warnings.labelWarning.warning} />
        )}

        <Field
          label="Page address:"
          required={true}
          info="Must start with https://. Customers see the site's name in the countdown before they are sent there."
        >
          <InputField
            value={formState.url}
            onChange={(event) => setters.handleUrl(event.target.value)}
            type="url"
            autoCapitalize="off"
            spellCheck={false}
            onBlur={(event) => setters.handleUrlBlur(event.target.value)}
            warningController={warnings.urlWarning}
          />
        </Field>
        {warnings.urlWarning.warning.isVisible && <InputWarning {...warnings.urlWarning.warning} />}

        {resolved ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-raised px-4 py-3">
            <p className="min-w-0 truncate text-xs text-[var(--color-muted)]">
              Customers will see: <span className="font-semibold text-[var(--color-text)]">{resolved.host}</span>
            </p>
            <a
              href={resolved.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Test link
            </a>
          </div>
        ) : null}
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
