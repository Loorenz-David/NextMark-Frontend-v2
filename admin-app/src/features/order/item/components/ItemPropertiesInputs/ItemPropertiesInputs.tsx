
import { CustomCounter } from '@/shared/inputs/CustomCounter'
import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import type { PopoverSelectOption } from '@/shared/inputs/OptionPopoverSelect'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'
import { Switch } from '@/shared/inputs/Switch'
import type { selectedItemTypeProperties } from '../../popups/ItemForm/useItemConfigurations'

type ItemPropertyInputValue = string | number | boolean | null

type ItemPropertyInputFieldProps = {
  property: selectedItemTypeProperties[number]
  propertyValues: Record<string, unknown> | null | undefined
  onPropertyValueChange: (propertyName: string, value: ItemPropertyInputValue) => void
}

const toTextValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (value == null) {
    return ''
  }
  return String(value)
}

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

const resolveSelectValue = (
  value: unknown,
  options: Array<string | number>,
): string | number | null => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  return options.find((option) => Object.is(option, value)) ?? null
}

const buildSelectOptions = (property: selectedItemTypeProperties[number] ): Array<PopoverSelectOption<string | number>> => {
  const values = (property.options ?? []) as Array<string | number>
 
  return values.map((option) => ({
    label: String(option),
    value: option,
  }))
}

const ItemPropertyInputField = ({
  property,
  propertyValues,
  onPropertyValueChange,
}: ItemPropertyInputFieldProps) => {


  const currentValue = propertyValues?.[property.name]

  if (property.field_type === 'text') {
    return (
      <Field label={`${property.name}:`} required={Boolean(property.required)}>
        <InputField
          value={toTextValue(currentValue)}
          onChange={(event) => onPropertyValueChange(property.name, event.target.value)}
        />
      </Field>
    )
  }

  if (property.field_type === 'number') {
    return (
      <Field label={`${property.name}:`} required={Boolean(property.required)}>
        <CustomCounter
          value={toNumberValue(currentValue)}
          onChange={(value) => onPropertyValueChange(property.name, value)}
        />
      </Field>
    )
  }

  if (property.field_type === 'select') {
    const options = buildSelectOptions(property)

    return (
      <Field label={`${property.name}:`} required={Boolean(property.required)}>
        <OptionPopoverSelect<string | number>
          options={options}
          value={resolveSelectValue(currentValue, options.map((option) => option.value))}
          onChange={(value) => onPropertyValueChange(property.name, value)}
          placeholder={`Select ${property.name}`}
          emptyLabel="No value"
          allowEmpty={true}
        />
      </Field>
    )
  }

  if (property.field_type === 'check_box') {
    return (
      <Field label={`${property.name}:`} required={Boolean(property.required)}>
        <Switch
          value={Boolean(currentValue)}
          onChange={(value) => onPropertyValueChange(property.name, value)}
        />
      </Field>
    )
  }

  return null
}

export type ItemPropertiesInputsProps = {
  selectedItemTypeProperties: selectedItemTypeProperties
  propertyValues: Record<string, unknown> | null | undefined
  onPropertyValueChange: (propertyName: string, value: ItemPropertyInputValue) => void
}

export const ItemPropertiesInputs = ({
  selectedItemTypeProperties,
  propertyValues,
  onPropertyValueChange,
}: ItemPropertiesInputsProps) => {
  if (!selectedItemTypeProperties.length) {
    return null
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-page)]/40 shadow-md p-3 py-6 relative">
      <div className="absolute top-0 left-[50%] px-3 py-[1px] bg-[var(--color-muted)] rounded-b-md -translate-x-1/2">
          <p className="text-xs font-semibold text-[var(--color-page)] text-center w-full">Item properties</p>
      </div>
      
      {selectedItemTypeProperties.map((property, index) => {
        const resolvedKey =
          property.client_id != null
            ? String(property.client_id)
            : `${property.name ?? 'property'}-${property.field_type ?? 'unknown'}-${index}`

        return (
        <ItemPropertyInputField
          key={resolvedKey}
          property={property}
          propertyValues={propertyValues}
          onPropertyValueChange={onPropertyValueChange}
        />
      )})}
    </section>
  )
}
