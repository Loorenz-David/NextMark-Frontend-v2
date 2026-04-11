import type { ObjectLinkSelectorItem } from "@/shared/inputs/ObjectLinkSelector";
import type { ZoneDefinition, ZoneLite, ZoneState } from "@/features/zone/types";

export type ZoneSelectorItem = (ZoneDefinition | ZoneLite | ZoneState) & {
  client_id?: string | null;
};

export type ZoneSelectorMode = "single" | "multi";

export type ZoneSelectorRowViewModel<TZone extends ZoneSelectorItem = ZoneSelectorItem> = {
  zone: TZone;
  selectionKey: string;
  title: string;
  subtitle: string;
  searchKeywords: string[];
  isSelected: boolean;
  isDisabled: boolean;
};

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

const getTemplateName = (zone: ZoneSelectorItem) =>
  "template_ref" in zone
    ? zone.template_ref?.name ?? null
    : "template" in zone
      ? zone.template?.name ?? null
      : null;

export const getZoneSelectionKey = (zone: ZoneSelectorItem): string => {
  if (typeof zone.client_id === "string" && zone.client_id.trim().length > 0) {
    return zone.client_id;
  }

  if (typeof zone.id === "number" || typeof zone.id === "string") {
    return String(zone.id);
  }

  return zone.name;
};

export const buildZoneSearchKeywords = (zone: ZoneSelectorItem): string[] => {
  const keywords = [
    zone.name,
    zone.zone_type ?? "",
    typeof zone.id === "number" ? String(zone.id) : "",
    typeof zone.client_id === "string" ? zone.client_id : "",
    getTemplateName(zone) ?? "",
    zone.is_active === true ? "active" : "inactive",
  ];

  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
};

export const buildZoneSubtitle = (zone: ZoneSelectorItem): string => {
  const details = [
    zone.zone_type ? `Type: ${zone.zone_type}` : null,
    typeof zone.id === "number" ? `Id: ${zone.id}` : null,
    zone.is_active === false ? "Inactive" : "Active",
  ];

  return details.filter(Boolean).join(" • ");
};

export const mapZoneToSelectorItem = (
  zone: ZoneSelectorItem,
): ObjectLinkSelectorItem => ({
  id:
    typeof zone.id === "number" || typeof zone.id === "string"
      ? zone.id
      : zone.client_id ?? zone.name,
  label: zone.name,
  details: buildZoneSubtitle(zone),
});

export const splitZoneSearchTerms = (searchValue: string): string[] =>
  searchValue
    .split(/\s+/)
    .map(normalizeSearchValue)
    .filter(Boolean);

export const filterZonesBySearch = <TZone extends ZoneSelectorItem>(
  zones: TZone[],
  searchValue: string,
): TZone[] => {
  const terms = splitZoneSearchTerms(searchValue);

  if (terms.length === 0) {
    return zones;
  }

  return zones.filter((zone) => {
    const searchableValue = buildZoneSearchKeywords(zone).join(" ").toLowerCase();
    return terms.every((term) => searchableValue.includes(term));
  });
};

export const buildZoneSelectorRows = <TZone extends ZoneSelectorItem>(
  zones: TZone[],
  selectedZones: TZone[],
  mode: ZoneSelectorMode,
): ZoneSelectorRowViewModel<TZone>[] => {
  const selectedKeys = new Set(selectedZones.map((zone) => getZoneSelectionKey(zone)));

  return zones.map((zone) => {
    const selectionKey = getZoneSelectionKey(zone);
    const isSelected = selectedKeys.has(selectionKey);

    return {
      zone,
      selectionKey,
      title: zone.name,
      subtitle: buildZoneSubtitle(zone),
      searchKeywords: buildZoneSearchKeywords(zone),
      isSelected,
      isDisabled: mode === "single" && isSelected,
    };
  });
};

export const removeSearchTerm = (searchValue: string, termToRemove: string): string =>
  splitZoneSearchTerms(searchValue)
    .filter((term) => term !== normalizeSearchValue(termToRemove))
    .join(" ");
