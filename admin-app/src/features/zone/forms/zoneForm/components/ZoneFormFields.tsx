import { FacilitySelector } from "@/features/infrastructure/facility/components";
import { VehicleSelector } from "@/features/infrastructure/vehicle/components/VehicleSelector/VehicleSelector";
import { ZoneVehicleCapabilitySelector } from "@/features/zone/components/ZoneVehicleCapabilitySelector/ZoneVehicleCapabilitySelector";
import { CustomCounter } from "@/shared/inputs/CustomCounter";
import { CustomNumberPicker } from "@/shared/inputs/CustomTimePicker/CustomNumberPicker";
import { CustomTimePicker } from "@/shared/inputs/CustomTimePicker";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { OptionPopoverSelect } from "@/shared/inputs/OptionPopoverSelect";
import { Cell, SplitRow } from "@/shared/layout/cells";

import { zoneRouteEndStrategyOptions } from "../../../domain/zoneEnums";
import { useZoneForm } from "../../../popups/ZoneForm/ZoneForm.context";
import { ZoneColorField } from "./ZoneColorField";

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

const routeEndStrategyOptions = [...zoneRouteEndStrategyOptions];

const parsePreferredVehicleIds = (value: string) =>
  value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

const parseCounterValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const secondsStringToMinutes = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.trunc(parsed / 60);
};

export const ZoneFormFields = () => {
  const { formState, setFormState } = useZoneForm();

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Identity"
            description="Define the zone and its template-level defaults."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Zone name:"
              required
              gap={2}
              warningPlacement="besidesLabel"
            >
              <InputField
                required
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                    template_name: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
                placeholder="Downtown Core"
              />
            </Field>
          </Cell>
          <Cell>
            <Field label="Zone color:" gap={2} warningPlacement="besidesLabel">
              <ZoneColorField
                value={formState.zone_color}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    zone_color: value,
                  }))
                }
                inputContainerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)]  pr-2">
          <Cell>
            <Field
              label="Default facility:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <FacilitySelector
                mode="single"
                selectedFacilityIds={
                  formState.default_facility_id
                    ? [formState.default_facility_id]
                    : []
                }
                onSelectionChange={(nextIds) =>
                  setFormState((current) => ({
                    ...current,
                    default_facility_id: String(nextIds[0] ?? ""),
                  }))
                }
                placeholder="Select a facility"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Planning Defaults"
            description="Operational limits and routing defaults for this zone template."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Max orders per route:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={parseCounterValue(formState.max_orders_per_route)}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    max_orders_per_route: String(value),
                  }))
                }
                min={0}
                step={1}
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Max vehicles:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomCounter
                value={parseCounterValue(formState.max_vehicles)}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    max_vehicles: String(value),
                  }))
                }
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
              label="Window start:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomTimePicker
                selectedTime={formState.operating_window_start || null}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    operating_window_start: value,
                  }))
                }
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Window end:" gap={2} warningPlacement="besidesLabel">
              <CustomTimePicker
                selectedTime={formState.operating_window_end || null}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    operating_window_end: value,
                  }))
                }
                className={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2  divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="ETA tolerance:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <CustomNumberPicker
                selectedValue={secondsStringToMinutes(
                  formState.eta_tolerance_seconds,
                )}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    eta_tolerance_seconds: String(value * 60),
                  }))
                }
                min={0}
                max={120}
                label="Minutes"
                containerClassName={"w-full text-sm text-[var(--color-text)]"}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Route end strategy:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <OptionPopoverSelect
                options={routeEndStrategyOptions}
                value={formState.default_route_end_strategy || null}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    default_route_end_strategy: String(value ?? ""),
                  }))
                }
                placeholder="Select route end strategy"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Vehicle Preferences"
            description="Capability and vehicle preferences consumed by routing."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field
              label="Required capabilities:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <ZoneVehicleCapabilitySelector
                selectedValue={formState.vehicle_capabilities_required}
                onSelectionChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    vehicle_capabilities_required: value,
                  }))
                }
                placeholder="Select capabilities"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              label="Preferred vehicles:"
              gap={2}
              warningPlacement="besidesLabel"
            >
              <VehicleSelector
                mode="multi"
                selectedVehicleIds={parsePreferredVehicleIds(
                  formState.preferred_vehicle_ids,
                )}
                onSelectionChange={(nextIds) =>
                  setFormState((current) => ({
                    ...current,
                    preferred_vehicle_ids: nextIds.join(", "),
                  }))
                }
                placeholder="Select preferred vehicles"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>
    </div>
  );
};
