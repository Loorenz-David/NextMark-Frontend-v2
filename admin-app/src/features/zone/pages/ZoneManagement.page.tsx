import { useEffect, useState } from "react";

import { useMessageHandler } from "@shared-message-handler";
import { useShallow } from "zustand/react/shallow";

import { loadZoneTemplateQuery } from "@/features/zone/actions/loadZoneTemplate.query";
import { zoneApi } from "@/features/zone/api/zone.api";
import { ZoneMapLayer } from "@/features/zone/components/ZoneMapLayer";
import { ZoneTemplateForm } from "@/features/zone/components/ZoneTemplateForm";
import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import {
  validateZoneTemplatePayload,
  type ZoneTemplateUpsertPayload,
} from "@/features/zone/domain/zoneTemplateForm.domain";
import {
  selectIsLoadingZonesForVersion,
  selectZonesByVersion,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import {
  selectSelectedZoneVersion,
  useZoneVersionStore,
} from "@/features/zone/store/zoneVersion.store";
import type { ZoneTemplate } from "@/features/zone/types";

export const ZoneManagementPage = () => {
  const { showMessage } = useMessageHandler();
  const versions = useZoneVersionStore((state) => state.versions);
  const isLoadingVersions = useZoneVersionStore((state) => state.isLoadingVersions);
  const setVersions = useZoneVersionStore((state) => state.setVersions);
  const setSelectedVersionId = useZoneVersionStore(
    (state) => state.setSelectedVersionId,
  );
  const selectedVersion = useZoneVersionStore(selectSelectedZoneVersion);
  const selectedZoneId = useZoneStore(
    (state) =>
      (typeof selectedVersion?.id === "number"
        ? state.selectedZoneIdByVersionId[selectedVersion.id]
        : null) ?? null,
  );
  const selectedZone = useZoneStore((state) =>
    typeof selectedVersion?.id === "number" && typeof selectedZoneId === "number"
      ? state.zonesByVersionId[selectedVersion.id]?.[selectedZoneId] ?? null
      : null,
  );
  const replaceZonesForVersion = useZoneStore(
    (state) => state.replaceZonesForVersion,
  );
  const setSelectedZoneId = useZoneStore((state) => state.setSelectedZoneId);
  const setLoadingVersions = useZoneVersionStore((state) => state.setLoadingVersions);
  const setLoadingZones = useZoneStore((state) => state.setLoadingZones);
  const setZoneTemplateFull = useZoneStore((state) => state.setZoneTemplateFull);
  const zoneList = useZoneStore(
    useShallow((state) => selectZonesByVersion(state, selectedVersion?.id)),
  );
  const isLoadingZones = useZoneStore((state) =>
    selectIsLoadingZonesForVersion(state, selectedVersion?.id),
  );

  const [zoneNameDraft, setZoneNameDraft] = useState("");
  const [cityKeyDraft, setCityKeyDraft] = useState("");
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [template, setTemplate] = useState<ZoneTemplate | null>(null);

  useEffect(() => {
    let active = true;

    const loadZoneVersions = async () => {
      setLoadingVersions(true);
      try {
        const response = await zoneApi.fetchZoneVersions();
        if (!active) return;

        const nextVersions = Array.isArray(response.data) ? response.data : [];
        setVersions(nextVersions);

        const activeVersion = nextVersions.find(
          (version) => version.is_active === true,
        );
        setSelectedVersionId(
          typeof activeVersion?.id === "number"
            ? activeVersion.id
            : typeof nextVersions[0]?.id === "number"
              ? nextVersions[0].id
              : null,
        );
      } catch (error) {
        console.error("Failed to load zone versions", error);
        if (!active) return;
        showMessage({ status: 500, message: "Unable to load zone versions." });
      } finally {
        if (active) {
          setLoadingVersions(false);
        }
      }
    };

    void loadZoneVersions();

    return () => {
      active = false;
    };
  }, [setLoadingVersions, setSelectedVersionId, setVersions, showMessage]);

  useEffect(() => {
    if (typeof selectedVersion?.id !== "number") {
      return;
    }
    const versionId = selectedVersion.id;

    let active = true;

    const loadZones = async () => {
      setLoadingZones(versionId, true);
      try {
        const response = await zoneApi.fetchZonesForVersion(versionId);
        if (!active) return;

        const nextZones = Array.isArray(response.data) ? response.data : [];
        replaceZonesForVersion(versionId, nextZones);
        setSelectedZoneId(
          typeof nextZones[0]?.id === "number" ? nextZones[0].id : null,
          versionId,
        );
      } catch (error) {
        console.error("Failed to load zones for version", error);
        if (!active) return;
        showMessage({
          status: 500,
          message: "Unable to load zones for selected version.",
        });
      } finally {
        if (active) {
          setLoadingZones(versionId, false);
        }
      }
    };

    void loadZones();

    return () => {
      active = false;
    };
  }, [
    replaceZonesForVersion,
    selectedVersion?.id,
    setLoadingZones,
    setSelectedZoneId,
    showMessage,
  ]);

  useEffect(() => {
    if (
      typeof selectedVersion?.id !== "number" ||
      typeof selectedZone?.id !== "number"
    ) {
      setTemplate(null);
      return;
    }
    const versionId = selectedVersion.id;
    const zoneId = selectedZone.id;

    let active = true;

    const loadTemplate = async () => {
      try {
        const nextTemplate = await loadZoneTemplateQuery(versionId, zoneId);
        if (!active) return;
        setZoneTemplateFull(versionId, zoneId, nextTemplate);
        setTemplate(nextTemplate);
      } catch (error) {
        console.error("Failed to load zone template", error);
        if (!active) return;
        setTemplate(null);
      }
    };

    void loadTemplate();

    return () => {
      active = false;
    };
  }, [selectedVersion?.id, selectedZone?.id, setZoneTemplateFull]);

  const handleCreateVersion = async () => {
    if (!cityKeyDraft.trim()) {
      showMessage({ status: 400, message: "City key is required." });
      return;
    }

    setIsCreatingVersion(true);
    try {
      const normalizedCityKey = cityKeyDraft.trim();
      const response = await zoneApi.createZoneVersion({
        city_key: normalizedCityKey,
        name: `${normalizedCityKey} Zones v${versions.length + 1}`,
      });
      const createdVersion = response.data;
      if (createdVersion) {
        setVersions([createdVersion, ...versions]);
        if (typeof createdVersion.id === "number") {
          setSelectedVersionId(createdVersion.id);
        }
      }
      setCityKeyDraft("");
    } catch (error) {
      console.error("Failed to create zone version", error);
      showMessage({ status: 500, message: "Unable to create zone version." });
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleActivateVersion = async (versionId: number) => {
    try {
      const response = await zoneApi.activateZoneVersion(versionId);
      const activatedVersion = response.data;
      const nextVersions = versions.map((version) => {
        if (typeof version.id !== "number") return version;
        if (version.id === versionId) {
          return {
            ...version,
            ...activatedVersion,
            is_active: true,
          };
        }
        return { ...version, is_active: false };
      });
      setVersions(nextVersions);
    } catch (error) {
      console.error("Failed to activate zone version", error);
      showMessage({ status: 500, message: "Unable to activate zone version." });
    }
  };

  const handleCreateZone = async () => {
    if (typeof selectedVersion?.id !== "number") {
      showMessage({ status: 400, message: "Select a zone version first." });
      return;
    }
    if (!zoneNameDraft.trim()) {
      showMessage({ status: 400, message: "Zone name is required." });
      return;
    }

    setIsCreatingZone(true);
    try {
      const payload = {
        name: zoneNameDraft.trim(),
        zone_type: "user" as const,
        geometry: null,
        centroid_lat: null,
        centroid_lng: null,
        min_lat: null,
        max_lat: null,
        min_lng: null,
        max_lng: null,
      };
      const response = await zoneApi.createZone(selectedVersion.id, payload);
      const createdZone = response.data;
      if (createdZone) {
        replaceZonesForVersion(selectedVersion.id, [
          createdZone,
          ...zoneList.map(mapZoneStateToRenderableDefinition),
        ]);
        if (typeof createdZone.id === "number") {
          setSelectedZoneId(createdZone.id, selectedVersion.id);
        }
      }
      setZoneNameDraft("");
    } catch (error) {
      console.error("Failed to create zone", error);
      showMessage({ status: 500, message: "Unable to create zone." });
    } finally {
      setIsCreatingZone(false);
    }
  };

  const handleSaveTemplate = async (payload: ZoneTemplateUpsertPayload) => {
    if (
      typeof selectedVersion?.id !== "number" ||
      typeof selectedZone?.id !== "number"
    ) {
      showMessage({
        status: 400,
        message: "Select a zone before saving template.",
      });
      return;
    }

    const validation = validateZoneTemplatePayload(payload);
    if (!validation.valid) {
      showMessage({
        status: 400,
        message: validation.issues[0],
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const response = await zoneApi.upsertZoneTemplate(
        selectedVersion.id,
        selectedZone.id,
        payload,
      );
      const nextTemplate = response.data ?? null;
      setZoneTemplateFull(selectedVersion.id, selectedZone.id, nextTemplate);
      setTemplate(nextTemplate);
      showMessage({ status: 200, message: "Zone template saved." });
    } catch (error) {
      console.error("Failed to save zone template", error);
      showMessage({ status: 500, message: "Unable to save zone template." });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5 p-4 text-white md:flex-row md:gap-4">
      <ZoneMapLayer zones={zoneList} selectedZoneId={selectedZoneId} />

      <section className="w-full rounded-xl border border-white/10 bg-white/5 p-4 md:max-w-sm">
        <h2 className="text-lg font-semibold">Zone Versions</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={cityKeyDraft}
            onChange={(event) => setCityKeyDraft(event.target.value)}
            placeholder="city_key"
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              void handleCreateVersion();
            }}
            disabled={isCreatingVersion}
            className="rounded-md border border-[var(--color-light-blue)] px-3 py-2 text-sm"
          >
            +
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {isLoadingVersions ? (
            <p className="text-sm text-white/70">Loading versions...</p>
          ) : (
            versions.map((version) => {
              const versionId =
                typeof version.id === "number" ? version.id : null;
              if (versionId == null) return null;
              const isSelected = selectedVersion?.id === versionId;
              return (
                <div
                  key={versionId}
                  className={`rounded-md border px-3 py-2 ${
                    isSelected
                      ? "border-[var(--color-light-blue)] bg-[var(--color-light-blue)]/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVersionId(versionId)}
                      className="text-left text-sm"
                    >
                      {version.city_key} v{version.version_number ?? "-"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleActivateVersion(versionId);
                      }}
                      className="text-xs text-[var(--color-light-blue)]"
                    >
                      {version.is_active ? "active" : "activate"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold">Zones</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={zoneNameDraft}
            onChange={(event) => setZoneNameDraft(event.target.value)}
            placeholder="Zone name"
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              void handleCreateZone();
            }}
            disabled={isCreatingZone}
            className="rounded-md border border-[var(--color-light-blue)] px-3 py-2 text-sm"
          >
            +
          </button>
        </div>

        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
          {isLoadingZones ? (
            <p className="text-sm text-white/70">Loading zones...</p>
          ) : zoneList.length === 0 ? (
            <p className="text-sm text-white/70">No zones for this version.</p>
          ) : (
            zoneList.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id, selectedVersion?.id)}
                  className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "border-[var(--color-light-blue)] bg-[var(--color-light-blue)]/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {zone.name || `Zone ${zone.id}`}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-black/10 p-3">
          <h3 className="mb-2 text-sm font-semibold">Zone Template</h3>
          {selectedZone ? (
            <ZoneTemplateForm
              initialTemplate={template}
              isSubmitting={isSavingTemplate}
              onSubmit={handleSaveTemplate}
            />
          ) : (
            <p className="text-sm text-white/70">
              Select a zone to edit template defaults.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
