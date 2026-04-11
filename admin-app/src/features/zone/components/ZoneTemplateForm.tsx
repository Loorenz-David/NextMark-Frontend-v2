import { useEffect, useState } from "react";

import {
  buildZoneTemplatePayload,
  getInitialZoneTemplateFormFields,
  type ZoneTemplateFormFields,
  type ZoneTemplateUpsertPayload,
} from "@/features/zone/domain/zoneTemplateForm.domain";
import type { ZoneTemplate } from "@/features/zone/types";

type ZoneTemplateFormProps = {
  initialTemplate?: ZoneTemplate | null;
  isSubmitting?: boolean;
  onSubmit: (payload: ZoneTemplateUpsertPayload) => void | Promise<void>;
};

export const ZoneTemplateForm = ({
  initialTemplate,
  isSubmitting = false,
  onSubmit,
}: ZoneTemplateFormProps) => {
  const [fields, setFields] = useState<ZoneTemplateFormFields>(
    getInitialZoneTemplateFormFields(initialTemplate),
  );

  useEffect(() => {
    setFields(getInitialZoneTemplateFormFields(initialTemplate));
  }, [initialTemplate]);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = buildZoneTemplatePayload(fields);
        if (!payload) {
          return;
        }
        void onSubmit(payload);
      }}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Template Name
          <input
            value={fields.template_name}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                template_name: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="Downtown Vans"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Default Facility ID
          <input
            value={fields.default_facility_id}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                default_facility_id: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Max Orders per Route
          <input
            value={fields.max_orders_per_route}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                max_orders_per_route: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Max Vehicles
          <input
            value={fields.max_vehicles}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                max_vehicles: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="4"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Window Start
          <input
            type="time"
            value={fields.operating_window_start}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                operating_window_start: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Window End
          <input
            type="time"
            value={fields.operating_window_end}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                operating_window_end: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          ETA Tolerance Seconds
          <input
            value={fields.eta_tolerance_seconds}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                eta_tolerance_seconds: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="300"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Route End Strategy
          <input
            value={fields.default_route_end_strategy}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                default_route_end_strategy: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="round_trip"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Vehicle Capabilities
          <input
            value={fields.vehicle_capabilities_required}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                vehicle_capabilities_required: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="cold_chain, fragile"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Preferred Vehicle IDs
          <input
            value={fields.preferred_vehicle_ids}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                preferred_vehicle_ids: event.target.value,
              }))
            }
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="10, 11"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border border-[var(--color-light-blue)] bg-[var(--color-light-blue)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-light-blue)] transition hover:bg-[var(--color-light-blue)]/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Save Template"}
      </button>
    </form>
  );
};
