import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { Switch } from '@/shared/inputs/Switch'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useItemPositionForm } from './ItemPositionForm.context'
import { useItemPositionFormConfig } from './useItemPositionFormConfig'
import { useItemPositionFormSetters } from './useItemPositionFormSetters'

export const ItemPositionFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } = useItemPositionForm()

  const setters = useItemPositionFormSetters({ setFormState, warnings })

  useItemPositionFormConfig({ formState, initialFormRef, payload })

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
            onChange={(event) => setters.handleName(event.target.value)}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible && (
          <InputWarning {...warnings.nameWarning.warning} />
        )}

        <Field label="Description:">
          <InputField
            value={formState.description}
            onChange={(event) => setters.handleDescription(event.target.value)}
          />
        </Field>

        <Field label="Default:">
          <Switch value={formState.default} onChange={setters.handleDefault} />
        </Field>

        <Field label="System:">
          <Switch value={formState.is_system} onChange={setters.handleSystem} />
        </Field>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
