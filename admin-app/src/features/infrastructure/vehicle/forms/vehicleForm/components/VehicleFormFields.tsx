import { Field } from "@/shared/inputs/FieldContainer";
import { CustomCounter } from "@/shared/inputs/CustomCounter";
import { CustomNumberPicker } from "@/shared/inputs/CustomTimePicker/CustomNumberPicker";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { OptionPopoverSelect } from "@/shared/inputs/OptionPopoverSelect";
import { Switch } from "@/shared/inputs/Switch";
import { Cell, SplitRow } from "@/shared/layout/cells";

import { FacilitySelector } from "../../../../facility/components";
import {
  vehicleCapabilityOptions,
  vehicleFuelTypeOptions,
  vehicleStatusOptions,
  vehicleTravelModeOptions,
} from "../../../../domain/infrastructureEnums";
import { useVehicleForm } from "../../../popups/VehicleForm/VehicleForm.context";
import { useVehicleFormSetters } from "../../../popups/VehicleForm/useVehicleFormSetters";

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-1 px-1">
    <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
    <p className="text-xs text-[var(--color-muted)]">{description}</p>
  </div>
);

export const VehicleFormFields = () => {
  const { formState, warnings, setFormState } = useVehicleForm();
  const setters = useVehicleFormSetters({ setFormState, warnings });
  const capabilitySelectOptions = [...vehicleCapabilityOptions];
  const fuelTypeSelectOptions = [...vehicleFuelTypeOptions];
  const travelModeSelectOptions = [...vehicleTravelModeOptions];
  const statusSelectOptions = [...vehicleStatusOptions];

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Identity"
            description="Core vehicle details and operational classification."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Registration:"
              required={true}
              gap={2}
              warningPlacement="besidesLabel"
              warningController={warnings.registrationNumberWarning}
            >
              <InputField
                value={formState.registration_number}
                onChange={(event) =>
                  setters.handleRegistrationNumber(event.target.value)
                }
                warningController={warnings.registrationNumberWarning}
                placeholder="e.g. AB-123-CD"
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Label:" gap={2} warningPlacement="besidesLabel">
              <InputField
                value={formState.label}
                onChange={(event) => setters.handleLabel(event.target.value)}
                placeholder="e.g. North Van 01"
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Fuel type:" gap={2} warningPlacement="besidesLabel">
              <OptionPopoverSelect
                options={fuelTypeSelectOptions}
                value={formState.fuel_type || null}
                onChange={(value) =>
                  setters.handleFuelType(String(value ?? ""))
                }
                placeholder="Select fuel type"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Travel mode:" gap={2} warningPlacement="besidesLabel">
              <OptionPopoverSelect
                options={travelModeSelectOptions}
                value={formState.travel_mode || null}
                onChange={(value) =>
                  setters.handleTravelMode(String(value ?? ""))
                }
                placeholder="Select travel mode"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Status:" gap={2} warningPlacement="besidesLabel">
              <OptionPopoverSelect
                options={statusSelectOptions}
                value={formState.status || null}
                onChange={(value) => setters.handleStatus(String(value ?? ""))}
                placeholder="Select status"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Active:" gap={2} warningPlacement="besidesLabel">
              <div className="flex min-h-9 items-center">
                <Switch
                  value={formState.is_active}
                  onChange={setters.handleIsActive}
                />
              </div>
            </Field>
          </Cell>
        </SplitRow>
        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)] pr-2">
          <Cell>
            <Field
              label="Capabilities:"
              gap={2}
              warningPlacement="besidesLabel"
              info="Backend canonical capability values."
            >
              <OptionPopoverSelect
                options={capabilitySelectOptions}
                value={formState.capabilities_csv || null}
                onChange={(value) =>
                  setters.handleCapabilitiesCsv(String(value ?? ""))
                }
                placeholder="Select capability"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>
        </SplitRow>
        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)] py-2 pr-2">
          <Cell>
            <Field
              label="Home facility:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <FacilitySelector
                mode="single"
                selectedFacilityIds={
                  formState.home_facility_id ? [formState.home_facility_id] : []
                }
                onSelectionChange={(nextIds) =>
                  setters.handleHomeFacilityId(String(nextIds[0] ?? ""))
                }
                placeholder="Select a facility"
                containerClassName={`${PLAIN_INPUT_CONTAINER_CLASS}`}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Capacity And Costs"
            description="Planning limits, throughput timings, and cost assumptions."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Max volume (m³):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={formState.max_volume_load_m3 ?? 0}
                onChange={setters.handleMaxVolumeLoadM3}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Max weight (kg):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={formState.max_weight_load_kg ?? 0}
                onChange={setters.handleMaxWeightLoadKg}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Max speed (km/h):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={formState.max_speed_kmh ?? 0}
                onChange={setters.handleMaxSpeedKmh}
                min={0}
                step={5}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Fixed cost:" gap={2} warningPlacement="besidesLabel">
              <CustomCounter
                value={formState.fixed_cost ?? 0}
                onChange={setters.handleFixedCost}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Cost per km:" gap={2} warningPlacement="besidesLabel">
              <CustomCounter
                value={formState.cost_per_km ?? 0}
                onChange={setters.handleCostPerKm}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Cost per hour:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={formState.cost_per_hour ?? 0}
                onChange={setters.handleCostPerHour}
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Distance limit (km):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={formState.travel_distance_limit_km ?? 0}
                onChange={setters.handleTravelDistanceLimitKm}
                min={0}
                step={5}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Duration limit (min):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomNumberPicker
                selectedValue={formState.travel_duration_limit_minutes}
                onChange={setters.handleTravelDurationLimitMinutes}
                min={0}
                max={24 * 60}
                label="Minutes"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Loading time / stop (min):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomNumberPicker
                selectedValue={formState.loading_time_per_stop_minutes}
                onChange={setters.handleLoadingTimePerStopMinutes}
                min={0}
                max={240}
                label="Minutes"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Unloading time / stop (min):"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomNumberPicker
                selectedValue={formState.unloading_time_per_stop_minutes}
                onChange={setters.handleUnloadingTimePerStopMinutes}
                min={0}
                max={240}
                label="Minutes"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>
    </div>
  );
};
