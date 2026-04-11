import type { ZoneDefinition } from "@/features/zone/types";

import { zoneApi } from "../api/zone.api";
import {
  buildZoneSearchQuery,
  type ZoneQueryExactFilters,
  type ZoneQuerySearchColumn,
} from "../domain/zoneSearch.domain";

type SearchZonesQueryParams = {
  versionId: number;
  input: string;
  limit?: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
  cursor?: string;
  signal?: AbortSignal;
};

export const searchZonesQuery = async ({
  versionId,
  input,
  limit = 10,
  selectedColumns = [],
  filters = {},
  cursor,
  signal,
}: SearchZonesQueryParams): Promise<ZoneDefinition[]> => {
  const query = buildZoneSearchQuery({
    input,
    limit,
    selectedColumns,
    filters,
    cursor,
  });
  const response = await zoneApi.searchZones(versionId, query, signal);
  return Array.isArray(response.data) ? response.data : [];
};
