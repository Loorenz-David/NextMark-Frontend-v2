import type { ObjectLinkSelectorMode } from "@/shared/inputs/ObjectLinkSelector";
import type {
  ZoneQueryExactFilters,
  ZoneQuerySearchColumn,
} from "@/features/zone/domain/zoneSearch.domain";

export type ZoneSelectorProps = {
  versionId?: number | null;
  mode?: ObjectLinkSelectorMode;
  selectedZoneIds: Array<number | string>;
  onSelectionChange: (nextIds: Array<number | string>) => void;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
  placeholder?: string;
  containerClassName?: string;
};
