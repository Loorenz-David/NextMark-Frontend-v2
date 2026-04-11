import { useMemo } from 'react'

import type { ItemType } from '@/features/itemConfigurations/types/itemType'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { SelectInputWithPopover } from '@/shared/inputs/SelectInputWithPopover'
import { FeaturePopupFooter } from '@/shared/popups/featurePopup'

import { ItemPropertiesInputs } from '../../components/ItemPropertiesInputs'
import { useItemForm } from './ItemForm.context'
import { CustomCounter } from '@/shared/inputs/CustomCounter'
import { ITEM_FORM_ITEM_TYPE_INFO } from './info/itemType.info'



export const ItemFormLayout = () => {
  const {
    formState,
    setters,
    warnings,
    canDelete,
    itemTypeOptions,
    selectedItemTypeProperties,
    payload,
    handleSave,
    handleDelete,
  } = useItemForm()


  const footerConfig = useMemo(
    () => ({
      saveButton: { label: 'Save item', action: handleSave },
      deleteButton: canDelete ? { label: 'Delete Item', action: handleDelete } : undefined,
    }),
    [canDelete, handleDelete, handleSave],
  )
  const isControlled = payload.mode === 'controlled'

  return (
    <div className="flex w-full h-full min-h-0 relative overflow-x-hidden pb-20">
      <div
        className={`flex flex-col gap-6 w-full h-full pb-30 overflow-y-auto  px-2 scroll-thin ${
          isControlled ? 'pb-4' : 'h-full pb-[56px] '
        }`}
      >
        <Field label="Article number:" required={true}>
          <InputField
            value={formState.article_number}
            onChange={setters.handleArticleNumber}
            warningController={warnings.articleNumberWarning}
          />
        </Field>
        {warnings.articleNumberWarning.warning.isVisible ? (
          <InputWarning {...warnings.articleNumberWarning.warning} />
        ) : null}

        <Field label="Item type:" required={true} info={ITEM_FORM_ITEM_TYPE_INFO}>
          <SelectInputWithPopover<ItemType>
            selectionMode="single"
            options={itemTypeOptions}
            value={formState.item_type}
            onChange={setters.handleItemTypeValue}
            onSelectOption={(option) => setters.handleItemTypeSelection(option.value)}
            allowCustomInput={true}
            placeholder="Type or select item type"
          />
        </Field>
        {warnings.itemTypeWarning.warning.isVisible ? (
          <InputWarning {...warnings.itemTypeWarning.warning} />
        ) : null}

        <ItemPropertiesInputs
          selectedItemTypeProperties={selectedItemTypeProperties}
          propertyValues={formState.properties}
          onPropertyValueChange={setters.handlePropertyValue}
        />
        <div className="flex gap-4">
          <Field label="Quantity:" required={true}>
            <CustomCounter
              min={1}
              value={formState.quantity}
              onChange={setters.handleQuantity}
            />
          </Field>
          

          <Field label="Weight ( gr ):">
            <CustomCounter
              step={1000}
              min={0}
              value={formState.weight != null ? formState.weight : 0}
              onChange={setters.handleWeight}
            />
          </Field>

        </div>
        <div className="flex gap-4 flex-col">
          <Field label="Width ( cm ):">
              <CustomCounter
                min={0}
                step={100}
                value={formState.dimension_width != null ? formState.dimension_width : 0}
                onChange={(value) => setters.handleDimension('dimension_width', value)}
                />
            </Field>

                
          <Field label="Height ( cm ):">
              <CustomCounter
                min={0}
                step={100}
                value={formState.dimension_height != null ? formState.dimension_height : 0}
                onChange={(value) => setters.handleDimension('dimension_height', value)}
                />
            </Field>

                
          <Field label="Depth ( cm ):">
              <CustomCounter
                min={0}
                step={100}
                value={formState.dimension_depth != null ? formState.dimension_depth : 0}
                onChange={(value) => setters.handleDimension('dimension_depth', value)}
                />
            </Field>
        </div>

      </div>

      {isControlled ? (
        <footer className="absolute bottom-0 flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-page)] px-2 py-3 ">
          {footerConfig.deleteButton ? (
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: footerConfig.deleteButton.action,
                className: 'py-2 px-4',
              }}
            >
              {footerConfig.deleteButton.label}
            </BasicButton>
          ) : <span />}

          <BasicButton
            params={{
              variant: 'primary',
              onClick: footerConfig.saveButton.action,
              className: 'py-3 px-4',
              style:{backgroundColor:'var(--color-turques)'}
            }}
          >
            {footerConfig.saveButton.label}
          </BasicButton>
        </footer>
      ) : (
        <FeaturePopupFooter>
          {footerConfig.deleteButton ? (
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: footerConfig.deleteButton.action,
                className: 'py-2 px-4 text-red-500 border-red-500',
              }}
            >
              {footerConfig.deleteButton.label}
            </BasicButton>
          ) : <span />}
          <div className="flex flex-1 justify-end">
            <BasicButton
              params={{
                variant: 'primary',
                onClick: footerConfig.saveButton.action,
                className: 'py-3 px-4',
                style:{backgroundColor:'var(--color-turques)'}
              }}
            >
              {footerConfig.saveButton.label}
            </BasicButton>
          </div>
        </FeaturePopupFooter>
      )}
    </div>
  )
}
