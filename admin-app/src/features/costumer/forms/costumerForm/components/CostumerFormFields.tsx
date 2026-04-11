import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'
import { Field } from '@/shared/inputs/FieldContainer'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { InputField } from '@/shared/inputs/InputField'
import { PhoneField } from '@/shared/inputs/PhoneField'
import { AddressAutocomplete } from '@/shared/inputs/address-autocomplete/AddressAutocomplete'
import { Cell, SplitRow } from '@/shared/layout/cells'
import { InfoHover } from '@/shared/layout/InfoHover'

import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { CostumerOperatingHoursEditor } from './CostumerOperatingHoursEditor'
import { COSTUMER_OPERATING_HOURS_INFO } from '../info/operatingHours.info'

type CostumerFormFieldsProps = {
  model: CostumerFormLayoutModel
  compact?: boolean
}

const PLAIN_INPUT_CONTAINER_CLASS = 'w-full'
const PLAIN_INPUT_CLASS =
  'w-full border-0 bg-transparent p-0 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]/70'

export const CostumerFormFields = ({ model, compact = false }: CostumerFormFieldsProps) => {
  const primaryPhone = model.formState.phones[0]?.phone ?? { prefix: DEFAULT_PREFIX, number: '' }
  const secondaryPhone = model.formState.phones[1]?.phone ?? { prefix: DEFAULT_PREFIX, number: '' }
  const defaultAddress = model.formState.addresses[0]?.address ?? null

  return (
    <form
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pt-4 scroll-thin ${
        compact ? 'pb-24' : 'h-full pb-[100px]'
      }`}
    >
      <div className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm">

        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)] border-t-0">
          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Email:"
              required={true}
              warningController={model.warnings.emailWarning}
            >
              <InputField
                value={model.formState.email}
                onChange={model.formSetters.handleEmail}
                warningController={model.warnings.emailWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

         <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field warningPlacement="besidesLabel" label="Primary Phone:">
              <PhoneField
                phoneNumber={primaryPhone} onChange={model.formSetters.handlePrimaryPhone}
              />
            </Field>
          </Cell>
           <Cell>
            <Field warningPlacement="besidesLabel" label="Secondary Phone:">
              <PhoneField
                phoneNumber={secondaryPhone}
                onChange={model.formSetters.handleSecondaryPhone}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="First Name:"
              required={true}
              warningController={model.warnings.firstNameWarning}
            >
              <InputField
                value={model.formState.first_name}
                onChange={model.formSetters.handleFirstName}
                warningController={model.warnings.firstNameWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Last Name:"
              required={true}
              warningController={model.warnings.lastNameWarning}
            >
              <InputField
                value={model.formState.last_name}
                onChange={model.formSetters.handleLastName}
                warningController={model.warnings.lastNameWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>
       

        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)]">
          <Cell>
            <Field warningPlacement="besidesLabel" label="Default Address:">

                <AddressAutocomplete
                  onSelectedAddress={model.formSetters.handleDefaultAddress}
                  selectedAddress={defaultAddress}
                  fieldClassName={' flex w-full items-center'}
                  containerClassName={' px-4 py-2  gap-2'}
                  inputClassName={'text-sm w-full '}
                  enableCurrentLocation
                />

            </Field>
          </Cell>
        </SplitRow>

       
      </div>
      <div className="flex px-2 py-5">
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[var(--color-muted)]">
              Operating Hours:
            </span>
            <InfoHover content={COSTUMER_OPERATING_HOURS_INFO} />
          </div>
          <CostumerOperatingHoursEditor model={model} />
          <InputWarning {...model.warnings.operatingHoursWarning.warning} />
        </div>
      </div>
    </form>
  )
}
