import { AnimatePresence, motion } from 'framer-motion'

import { AddressAutocomplete } from '@/shared/inputs/address-autocomplete/AddressAutocomplete'
import { CustomDateTimePicker } from '@/shared/inputs/CustomDateTimePicker'
import { Field } from '@/shared/inputs/FieldContainer'
import { InputWarning } from '@/shared/inputs/InputWarning'
import SegmentedSelect from '@/shared/inputs/SegmentedSelect'
import { toDateOnly } from '@/shared/data-validation/timeValidation'

import { useLocalDeliveryEditForm } from '../LocalDeliveryEditForm.context'
import { LOCAL_DELIVERY_ROUTE_END_STRATEGY_INFO } from '../info/routeEndStrategy.info'
import { LocalDeliveryEditFormSectionGroup } from './LocalDeliveryEditFormSectionGroup'

export const LocalDeliveryEditFormRouteSections = () => {
  const {
    formState,
    formWarnings,
    formSetters,
  } = useLocalDeliveryEditForm()

  const startDate = formState.delivery_plan.start_date
    ? new Date(toDateOnly(formState.delivery_plan.start_date))
    : null
  const endDate = formState.delivery_plan.end_date
    ? new Date(toDateOnly(formState.delivery_plan.end_date))
    : null

  return (
    <>
      <LocalDeliveryEditFormSectionGroup label="Start">
        <Field label="">
          <AddressAutocomplete
            onSelectedAddress={formSetters.handleRouteStartLocation}
            selectedAddress={formState.route_solution.start_location}
            fieldClassName={' flex w-full items-center'}
            containerClassName={' px-4 py-2  gap-2 border border-[var(--color-border-accent)] rounded-lg'}
            inputClassName={'text-sm w-full '}
            placeholder="search for start address..."
            intentKey={'local-delivery-start-address'}
            enableSavedLocations
            enableCurrentLocation
          />
        </Field>
        <Field label="">
          <CustomDateTimePicker
            date={startDate}
            onChangeDate={formSetters.handlePlanStartDate}
            selectedTime={formState.route_solution.set_start_time}
            onChangeTime={formSetters.handleRouteStartTime}
            disablePastDate
            disablePastTime
            datePickerClassName={"py-3 ml-3"}
            timePickerClassName={"py-3"}
          />
        </Field>
        {formWarnings.planDateWarning.warning && (
          <InputWarning {...formWarnings.planDateWarning.warning} />
        )}
        {formWarnings.routeStartTimeWarning.warning && (
          <InputWarning {...formWarnings.routeStartTimeWarning.warning} />
        )}
      </LocalDeliveryEditFormSectionGroup>

      <LocalDeliveryEditFormSectionGroup
        label="End"
        info={LOCAL_DELIVERY_ROUTE_END_STRATEGY_INFO}
      >
        <Field label="">
          <SegmentedSelect
            options={[
              { label: 'Round trip', value: 'round_trip' },
              { label: 'Custom address', value: 'custom_end_address' },
              { label: 'End at last stop', value: 'end_at_last_stop' },
            ]}
            selectedValue={formState.route_solution.route_end_strategy}
            onSelect={formSetters.handleRouteEndStrategy}
            styleConfig={{
              textSize: '12px',
              containerBg: 'rgba(255,255,255,0.045)',
              containerBorder: 'rgba(255,255,255,0.14)',
              containerShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              selectedBg: 'linear-gradient(180deg, rgba(113, 205, 233, 0.22), rgba(84, 146, 209, 0.16))',
              selectedBorder: 'rgba(113, 205, 233, 0.42)',
              selectedShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
              textColor: 'rgba(255,255,255,0.68)',
              selectedTextColor: 'rgb(213, 247, 255)',
              containerPadding: '6px',
              buttonPadding: '12px 14px',
            }}
          />
        </Field>
        <AnimatePresence initial={false}>
          {formState.route_solution.route_end_strategy == 'custom_end_address' && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Field label="">
                <AddressAutocomplete
                  onSelectedAddress={formSetters.handleRouteEndLocation}
                  selectedAddress={formState.route_solution.end_location}
                  fieldClassName={' flex w-full items-center'}
                  containerClassName={' px-4 py-2  gap-2 border border-[var(--color-border-accent)] rounded-lg'}
                  inputClassName={'text-sm w-full '}
                  placeholder="search for end address..."
                  intentKey={'local-delivery-end-address'}
                  enableSavedLocations
                  enableCurrentLocation
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
        <Field label="">
          <CustomDateTimePicker
            date={endDate}
            onChangeDate={formSetters.handlePlanEndDate}
            selectedTime={formState.route_solution.set_end_time}
            onChangeTime={formSetters.handleRouteEndTime}
            disablePastDate
            disablePastTime
            datePickerClassName={"py-3 ml-3"}
            timePickerClassName={"py-3"}
          />
        </Field>
        {formWarnings.routeEndTimeWarning.warning && (
          <InputWarning {...formWarnings.routeEndTimeWarning.warning} />
        )}
      </LocalDeliveryEditFormSectionGroup>
    </>
  )
}
