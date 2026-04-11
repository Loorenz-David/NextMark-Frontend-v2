import type { Dispatch, SetStateAction } from "react";

import type { CreateRouteGroupFormState } from "./CreateRouteGroupForm.types";

type CreateRouteGroupFormSettersProps = {
  setFormState: Dispatch<SetStateAction<CreateRouteGroupFormState>>;
};

export const createRouteGroupFormSetters = ({
  setFormState,
}: CreateRouteGroupFormSettersProps) => ({
  setName: (name: string) =>
    setFormState((prev) => ({
      ...prev,
      name,
    })),
  setZoneId: (zone_id: number | null, zoneName?: string | null) =>
    setFormState((prev) => ({
      ...prev,
      zone_id,
      name:
        zone_id !== null && zoneName
          ? zoneName
          : zone_id === null
            ? prev.name
            : prev.name,
    })),
});
