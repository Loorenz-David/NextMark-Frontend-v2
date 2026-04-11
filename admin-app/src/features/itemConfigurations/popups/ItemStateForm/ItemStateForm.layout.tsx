import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useItemStateForm } from './ItemStateForm.context'
import { useItemStateFormConfig } from './useItemStateFormConfig'
import { useItemStateFormSetters } from './useItemStateFormSetters'

export const ItemStateFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } = useItemStateForm()

  const setters = useItemStateFormSetters({ setFormState, warnings })

  useItemStateFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Create' : 'Save', action: handleSave },
      ...(payload.mode === 'edit' ? { deleteButton: { label: 'Delete', action: handleDelete } } : {}),
    }),
    [handleSave, handleDelete, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">
        <Field label="Name:" required={true}>
          <InputField
            value={formState.name}
            onChange={(event) => setters.handleName(event.target.value ?? '')}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible && (
          <InputWarning {...warnings.nameWarning.warning} />
        )}

        <Field label="Color:">
          <div className="flex items-center gap-3">
            <InputField
              type="color"
              value={formState.color || '#000000'}
              onChange={(event) => setters.handleColor(event.target.value ?? '')}
              inputClassName="h-10 w-12 cursor-pointer rounded-md border border-[var(--color-border)] bg-transparent p-0"
              fieldClassName="border-none bg-transparent p-0"
              aria-label="Select color"
            />
            <InputField
              value={formState.color}
              onChange={(event) => setters.handleColor(event.target.value ?? '')}
              placeholder="#ff0000"
            />
          </div>
        </Field>

        <Field label="Description:">
          <InputField
            value={formState.description}
            onChange={(event) => setters.handleDescription(event.target.value ?? '')}
          />
        </Field>

    
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
