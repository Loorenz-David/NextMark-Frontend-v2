import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { ItemRelationSelector } from '@/shared/relations/ItemRelationSelector'

import { useItemTypeForm } from './ItemTypeForm.context'
import { useItemTypeFormConfig } from './useItemTypeFormConfig'
import { useItemTypeFormSetters } from './useItemTypeFormSetters'
import { useItemTypePropertyQuery } from './queries/useItemTypePropertyQuery'

export const ItemTypeFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } = useItemTypeForm()

  const setters = useItemTypeFormSetters({ setFormState, warnings })
  const propertyQuery = useItemTypePropertyQuery(formState.properties)

  useItemTypeFormConfig({ formState, initialFormRef, payload })

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
            onChange={(e)=> setters.handleName(e.target.value ?? '')}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible && (
          <InputWarning {...warnings.nameWarning.warning} />
        )}

        <Field label="Properties:">
          <ItemRelationSelector
            options={propertyQuery.options}
            selectedValues={formState.properties}
            onToggle={setters.handleProperties}
            queryFn={propertyQuery.queryFn}
            filterOptions={propertyQuery.filterOptions}
            searchPlaceholder="Search properties"
          />
        </Field>

      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
