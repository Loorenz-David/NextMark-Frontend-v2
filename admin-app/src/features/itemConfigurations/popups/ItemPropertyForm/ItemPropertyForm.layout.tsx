import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { Switch } from '@/shared/inputs/Switch'
import { TagInput } from '@/shared/inputs/TagInput'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { ItemRelationSelector } from '@/shared/relations/ItemRelationSelector'

import { useItemPropertyForm } from './ItemPropertyForm.context'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'

export const ItemPropertyFormLayout = () => {
  const { payload, formState, warnings, setters, itemTypeQuery, handleSave, handleDelete } = useItemPropertyForm()


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
            onChange={(e) => setters.handleName(e.target.value ?? '')}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible && (
          <InputWarning {...warnings.nameWarning.warning} />
        )}

        <Field label="Required:">
          <Switch
            value={formState.required}
            onChange={setters.handleRequired}
          />
        </Field>

        <Field label="Input type :">
          <OptionPopoverSelect
            allowEmpty={false}
            options={[
              { label: 'Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Select', value: 'select' },
              { label: 'Check box', value: 'check_box' },
            ]}
            value={formState.field_type}
            onChange={setters.handleInputType}
          />
        </Field>

        {formState.field_type === 'select' && (
          <Field label="Options:" required={true}>
            <TagInput
              values={formState.options}
              onAdd={(value) => setters.handleOptions(value, 'add')}
              onRemove={(value) => setters.handleOptions(value, 'remove')}
              placeholder="Add option..."
            />
          </Field>
        )}

        <Field label="Item types:">
          <ItemRelationSelector
            options={itemTypeQuery.options}
            selectedValues={formState.item_types}
            onToggle={setters.handleItemTypes}
            queryFn={itemTypeQuery.queryFn}
            filterOptions={itemTypeQuery.filterOptions}
            searchPlaceholder="Search item types"
          />
        </Field>

        

      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
