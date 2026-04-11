import { Field } from '@/shared/inputs/FieldContainer'
import { CustomCounter } from '@/shared/inputs/CustomCounter'
import { InputField, PLAIN_INPUT_CLASS, PLAIN_INPUT_CONTAINER_CLASS } from '@/shared/inputs/InputField'
import { OperatingHoursEditor } from '@/shared/inputs/OperatingHoursEditor'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'
import { Switch } from '@/shared/inputs/Switch'
import { CustomNumberPicker } from '@/shared/inputs/CustomTimePicker/CustomNumberPicker'
import { AddressAutocomplete } from '@/shared/inputs/address-autocomplete/AddressAutocomplete'
import { Cell, SplitRow } from '@/shared/layout/cells'
import { useMemo } from 'react'

import { facilityTypeOptions } from '../../../../domain/infrastructureEnums'
import {
  facilityOperatingHoursDayOptions,
  type FacilityOperatingHoursEditorEntry,
  normalizeFacilityOperatingHoursForEditor,
  serializeFacilityOperatingHoursEditor,
  setFacilityOperatingHoursCloseTime,
  setFacilityOperatingHoursOpenTime,
  toggleFacilityOperatingHoursDay,
} from '../../../domain/facilityForm.domain'
import { useFacilityForm } from '../../../popups/FacilityForm/FacilityForm.context'
import { useFacilityFormSetters } from '../../../popups/FacilityForm/useFacilityFormSetters'

const SectionHeading = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="flex flex-col gap-1 px-1">
    <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
    <p className="text-xs text-[var(--color-muted)]">{description}</p>
  </div>
)

export const FacilityFormFields = () => {
  const { formState, warnings, setFormState } = useFacilityForm()
  const setters = useFacilityFormSetters({ setFormState, warnings })
  const facilityTypeSelectOptions = [...facilityTypeOptions]
  const operatingHoursEntries = useMemo<FacilityOperatingHoursEditorEntry[]>(
    () => normalizeFacilityOperatingHoursForEditor(formState.operating_hours_json),
    [formState.operating_hours_json],
  )

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Identity"
            description="Core facility information, type, and operational role."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Name:"
              required={true}
              gap={2}
              warningPlacement="besidesLabel"
              warningController={warnings.nameWarning}
            >
              <InputField
                value={formState.name}
                onChange={(event) => setters.handleName(event.target.value)}
                warningController={warnings.nameWarning}
                placeholder="e.g. Main Warehouse"
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Facility type:"
              required={true}
              gap={2}
              warningPlacement="besidesLabel"
              warningController={warnings.facilityTypeWarning}
            >
              <OptionPopoverSelect
                options={facilityTypeSelectOptions}
                value={formState.facility_type || null}
                onChange={(value) => setters.handleFacilityType(String(value ?? ''))}
                placeholder="Select facility type"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>
        </SplitRow>

        <div className="border-t border-[var(--color-border-accent)] cell-default">
          <Field
            label="Property location:"
            gap={2}
            warningPlacement="besidesLabel"
            warningController={warnings.locationWarning}
          >
            <AddressAutocomplete
              onSelectedAddress={setters.handleLocation}
              selectedAddress={formState.property_location}
              fieldClassName="flex w-full items-center"
              containerClassName="gap-2 px-4 py-2"
              inputClassName="w-full text-sm"
              intentKey="facility-form-property-location"
              enableCurrentLocation
              enableSavedLocations
            />
          </Field>
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Can dispatch:" gap={2} warningPlacement="besidesLabel">
              <div className="flex min-h-9 items-center">
                <Switch value={formState.can_dispatch} onChange={setters.handleCanDispatch} />
              </div>
            </Field>
          </Cell>

          <Cell>
            <Field label="Can receive returns:" gap={2} warningPlacement="besidesLabel">
              <div className="flex min-h-9 items-center">
                <Switch value={formState.can_receive_returns} onChange={setters.handleCanReceiveReturns} />
              </div>
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Operations"
            description="Daily limits, default service times, and backend JSON configuration fields."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Default loading time (min):" gap={2} warningPlacement="besidesLabel">
              <CustomNumberPicker
                selectedValue={formState.default_loading_time_minutes}
                onChange={setters.handleDefaultLoadingTimeMinutes}
                min={0}
                max={240}
                label="Minutes"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Default unloading time (min):" gap={2} warningPlacement="besidesLabel">
              <CustomNumberPicker
                selectedValue={formState.default_unloading_time_minutes}
                onChange={setters.handleDefaultUnloadingTimeMinutes}
                min={0}
                max={240}
                label="Minutes"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Max orders / day:" gap={2} warningPlacement="besidesLabel">
              <CustomCounter
                value={formState.max_orders_per_day ?? 0}
                onChange={setters.handleMaxOrdersPerDay}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <div className="flex h-full items-center px-4 py-3 text-xs text-[var(--color-muted)]">
              Operating hours are configured visually and stored as backend JSON behind the form boundary.
            </div>
          </Cell>
        </SplitRow>

        <div className="border-t border-[var(--color-border-accent)] cell-default">
          <Field
            label="Operating hours:"
            gap={2}
            warningPlacement="besidesLabel"
            info="Select the active days and define open and close times."
          >
            <OperatingHoursEditor
              days={facilityOperatingHoursDayOptions}
              entries={operatingHoursEntries.map((entry) => ({
                key: entry.day,
                enabled: true,
                openTime: entry.open,
                closeTime: entry.close,
              }))}
              onToggleDay={(day) =>
                setters.handleOperatingHoursJson(
                  serializeFacilityOperatingHoursEditor(
                    toggleFacilityOperatingHoursDay({ entries: operatingHoursEntries, day }),
                  ),
                )
              }
              onOpenTimeChange={(day, value) =>
                setters.handleOperatingHoursJson(
                  serializeFacilityOperatingHoursEditor(
                    setFacilityOperatingHoursOpenTime({
                      entries: operatingHoursEntries,
                      day,
                      value,
                    }),
                  ),
                )
              }
              onCloseTimeChange={(day, value) =>
                setters.handleOperatingHoursJson(
                  serializeFacilityOperatingHoursEditor(
                    setFacilityOperatingHoursCloseTime({
                      entries: operatingHoursEntries,
                      day,
                      value,
                    }),
                  ),
                )
              }
              allowClosedToggle={false}
            />
          </Field>
        </div>
      </section>
    </div>
  )
}
