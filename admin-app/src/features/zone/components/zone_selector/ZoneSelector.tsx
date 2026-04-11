import { useMemo, useState } from "react";

import { ObjectLinkSelector } from "@/shared/inputs/ObjectLinkSelector";
import {
  getZoneSelectionKey,
  mapZoneToSelectorItem,
} from "@/features/zone/domain/zoneSelector.domain";
import { useHydrateSelectedZones } from "@/features/zone/hooks/useHydrateSelectedZones";
import { useZoneSelectorQuery } from "@/features/zone/hooks/useZoneSelectorQuery";
import { useZonesByVersion } from "@/features/zone/hooks/useZoneSelectors";
import {
  selectWorkingZoneVersionId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import type {
  ZoneQueryExactFilters,
  ZoneQuerySearchColumn,
} from "@/features/zone/domain/zoneSearch.domain";

import type { ZoneSelectorProps } from "./ZoneSelector.types";

const EMPTY_SELECTED_COLUMNS: ZoneQuerySearchColumn[] = [];
const EMPTY_FILTERS: ZoneQueryExactFilters = {};

export const ZoneSelector = ({
  versionId,
  mode = "single",
  selectedZoneIds,
  onSelectionChange,
  selectedColumns = EMPTY_SELECTED_COLUMNS,
  filters = EMPTY_FILTERS,
  placeholder = "Select a zone",
  containerClassName,
}: ZoneSelectorProps) => {
  const [query, setQuery] = useState("");
  const fallbackVersionId = useZoneStore(selectWorkingZoneVersionId);
  const resolvedVersionId = versionId ?? fallbackVersionId;
  const zones = useZonesByVersion(resolvedVersionId);

  useHydrateSelectedZones({
    versionId: resolvedVersionId,
    selectedZoneIds,
  });
  const { items, isLoading } = useZoneSelectorQuery({
    versionId: resolvedVersionId,
    query,
    selectedColumns,
    filters,
  });

  const selectedItems = useMemo(() => {
    const selectedIdSet = new Set(selectedZoneIds.map(String));

    return zones
      .filter((zone) => {
        const selectionKey = getZoneSelectionKey(zone);
        return (
          selectedIdSet.has(selectionKey) ||
          selectedIdSet.has(String(zone.id ?? "")) ||
          selectedIdSet.has(String(zone.client_id ?? ""))
        );
      })
      .map(mapZoneToSelectorItem);
  }, [selectedZoneIds, zones]);

  const options = useMemo(() => items.map(mapZoneToSelectorItem), [items]);
  const zoneByOptionId = useMemo(
    () =>
      new Map(
        zones.map((zone) => [String(mapZoneToSelectorItem(zone).id), zone] as const),
      ),
    [zones],
  );

  return (
    <ObjectLinkSelector
      mode={mode}
      options={options}
      selectedItems={selectedItems}
      queryValue={query}
      onQueryChange={setQuery}
      loading={isLoading}
      placeholder={placeholder}
      containerClassName={containerClassName}
      emptyOptionsMessage="No zones found."
      emptySelectedMessage="No selected zones."
      selectedOverlayTitle={mode === "single" ? "Selected zone" : "Selected zones"}
      selectedButtonLabel={mode === "single" ? "Zone" : "Zones"}
      onSelectItem={(item) => {
        setQuery("");

        if (mode === "single") {
          onSelectionChange([item.id]);
          return;
        }

        const nextIds = Array.from(new Set([...selectedZoneIds, item.id]));
        onSelectionChange(nextIds);
      }}
      onRemoveSelectedItem={(item) => {
        setQuery("");
        const matchedZone = zoneByOptionId.get(String(item.id));
        const removableKeys = new Set([
          String(item.id),
          String(matchedZone?.id ?? ""),
          String(matchedZone?.client_id ?? ""),
        ]);

        onSelectionChange(
          selectedZoneIds.filter((id) => !removableKeys.has(String(id))),
        );
      }}
    />
  );
};
