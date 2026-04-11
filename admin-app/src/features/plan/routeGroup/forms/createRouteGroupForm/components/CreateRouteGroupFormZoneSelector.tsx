import { Field } from "@/shared/inputs/FieldContainer";

import { useCreateRouteGroupForm } from "../CreateRouteGroupForm.context";

export const CreateRouteGroupFormZoneSelector = () => {
  const { availableZones, formSetters, formState } = useCreateRouteGroupForm();

  return (
    <Field label="Zone (optional):">
      <div className="space-y-2 rounded-md border border-[var(--color-border-accent)] px-3 py-2">
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
            formState.zone_id == null
              ? "border-[rgb(var(--color-light-blue-r),0.6)] bg-[rgb(var(--color-light-blue-r),0.08)]"
              : "border-transparent bg-[var(--color-page)] hover:border-white/10"
          }`}
          onClick={() => formSetters.setZoneId(null)}
        >
          <span className="font-medium text-[var(--color-text)]">No zone</span>
          <span className="text-xs text-[var(--color-muted)]">
            Create a custom route group
          </span>
        </button>

        {availableZones.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--color-border-accent)] px-3 py-2 text-sm text-[var(--color-muted)]">
            No zones are available for this plan version.
          </p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {availableZones.map((zone) => {
              const isSelected = formState.zone_id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  disabled={zone.disabled}
                  className={`flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-[rgb(var(--color-light-blue-r),0.6)] bg-[rgb(var(--color-light-blue-r),0.08)]"
                      : zone.disabled
                        ? "cursor-not-allowed border-transparent bg-white/[0.03] opacity-55"
                        : "border-transparent bg-[var(--color-page)] hover:border-white/10"
                  }`}
                  onClick={() =>
                    formSetters.setZoneId(isSelected ? null : zone.id, zone.name)
                  }
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {zone.name}
                    </p>
                    {zone.assignedGroupName ? (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Already assigned to {zone.assignedGroupName}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Create or reopen the route group for this zone
                      </p>
                    )}
                  </div>
                  <span className="ml-3 pt-0.5 text-xs text-[var(--color-muted)]">
                    {isSelected ? "Selected" : zone.disabled ? "Unavailable" : "Select"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Field>
  );
};
