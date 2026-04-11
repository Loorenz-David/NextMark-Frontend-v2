import { useShallow } from "zustand/react/shallow";

import { selectZonesByVersion, useZoneStore } from "../store/zone.store";

export const useZonesByVersion = (versionId: number | null | undefined) =>
  useZoneStore(useShallow((state) => selectZonesByVersion(state, versionId)));
