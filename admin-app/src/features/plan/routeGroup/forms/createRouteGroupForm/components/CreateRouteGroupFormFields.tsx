import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";

import { useCreateRouteGroupForm } from "../CreateRouteGroupForm.context";
import { CreateRouteGroupFormZoneSelector } from "./CreateRouteGroupFormZoneSelector";

export const CreateRouteGroupFormFields = () => {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4 shadow-sm">
      {/* <CreateRouteGroupFormZoneSelector /> */}

      <p className="text-xs text-[var(--color-muted)]">
        If you select a zone, its label is used for the route group name and the
        group is created as zone-backed. Leave it unset to create a no-zone
        route group with route-solution defaults.
      </p>
    </div>
  );
};
