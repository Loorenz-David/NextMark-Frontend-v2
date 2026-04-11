import { useMemo } from "react";

import {
  buildFallbackZoneSearchResult,
  type ZoneQueryExactFilters,
  type ZoneQuerySearchColumn,
} from "../domain/zoneSearch.domain";
import { useZonesByVersion } from "./useZoneSelectors";

export const useZoneStoreQuery = ({
  versionId,
  query,
  limit = 25,
  selectedColumns = [],
  filters = {},
}: {
  versionId: number | null | undefined;
  query: string;
  limit?: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
}) => {
  const zones = useZonesByVersion(versionId);

  return useMemo(
    () =>
      buildFallbackZoneSearchResult(
        zones,
        query,
        limit,
        selectedColumns,
        filters,
      ).zones,
    [filters, limit, query, selectedColumns, zones],
  );
};
