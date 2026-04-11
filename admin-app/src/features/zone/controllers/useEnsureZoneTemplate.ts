import { useCallback } from "react";

import { loadZoneTemplateQuery } from "@/features/zone/actions/loadZoneTemplate.query";
import {
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";

export const useEnsureZoneTemplate = (
  versionId: number | null | undefined,
  zoneId: number | null | undefined,
) => {
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, versionId, zoneId),
  );
  const markZoneTemplateLoading = useZoneStore(
    (state) => state.markZoneTemplateLoading,
  );
  const setZoneTemplateFull = useZoneStore((state) => state.setZoneTemplateFull);
  const setZoneTemplateError = useZoneStore(
    (state) => state.setZoneTemplateError,
  );

  const load = useCallback(async () => {
    if (typeof versionId !== "number" || typeof zoneId !== "number" || !zone) {
      return null;
    }

    if (zone.template_full) {
      return zone.template_full;
    }

    if (!zone.template_ref && !zone.template_full) {
      return null;
    }

    if (zone.is_loading_template) {
      return zone.template_full;
    }

    markZoneTemplateLoading(versionId, zoneId, true);

    try {
      const template = await loadZoneTemplateQuery(versionId, zoneId);
      setZoneTemplateFull(versionId, zoneId, template);
      return template;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load zone template.";
      setZoneTemplateError(versionId, zoneId, message);
      return null;
    }
  }, [
    markZoneTemplateLoading,
    setZoneTemplateError,
    setZoneTemplateFull,
    versionId,
    zone,
    zoneId,
  ]);

  return { load };
};
