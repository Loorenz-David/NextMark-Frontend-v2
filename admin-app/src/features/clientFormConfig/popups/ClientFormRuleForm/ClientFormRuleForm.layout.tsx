import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { Switch } from '@/shared/inputs/Switch'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useClientFormRuleForm } from './ClientFormRuleForm.context'
import { useClientFormRuleFormConfig } from './useClientFormRuleFormConfig'
import { useClientFormRuleFormSetters } from './useClientFormRuleFormSetters'

export const ClientFormRuleFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } =
    useClientFormRuleForm()

  const setters = useClientFormRuleFormSetters({ setFormState, warnings })

  useClientFormRuleFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Create' : 'Save', action: handleSave },
      ...(payload.mode === 'edit' ? { deleteButton: { label: 'Delete', action: handleDelete } } : {}),
    }),
    [handleSave, handleDelete, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 pb-[40px] scroll-thin">
        <Field label="Title:" required={true}>
          <InputField
            value={formState.title}
            onChange={(event) => setters.handleTitle(event.target.value)}
            warningController={warnings.titleWarning}
          />
        </Field>
        {warnings.titleWarning.warning.isVisible && (
          <InputWarning {...warnings.titleWarning.warning} />
        )}

        <Field label="Description:">
          <InputField
            value={formState.body}
            onChange={(event) => setters.handleBody(event.target.value)}
          />
        </Field>

        <Field
          label="Icon key:"
          info="A free-form key the public form maps to an icon, for example “box” or “clock”."
        >
          <InputField
            value={formState.icon}
            onChange={(event) => setters.handleIcon(event.target.value)}
          />
        </Field>

        <Field label="Image URL:">
          <InputField
            value={formState.image_url}
            onChange={(event) => setters.handleImageUrl(event.target.value)}
          />
        </Field>

        <Field
          label="Show on the form:"
          info="Disabled rules stay saved here but never reach the customer."
        >
          <Switch value={formState.enabled} onChange={setters.handleEnabled} />
        </Field>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
