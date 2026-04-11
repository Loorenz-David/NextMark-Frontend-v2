import { useEffect, useMemo, useRef, useState } from "react";

import { useMessageHandler } from "@shared-message-handler";
import { ApiError } from "@/lib/api/ApiClient";

import { searchZonesQuery } from "../actions/searchZones.query";
import {
  type ZoneQueryExactFilters,
  type ZoneQuerySearchColumn,
} from "../domain/zoneSearch.domain";
import { useZoneStore } from "../store/zone.store";
import { useZoneStoreQuery } from "./useZoneStoreQuery";

const INITIAL_SELECTOR_LIMIT = 3;

export const useZoneSelectorQuery = ({
  versionId,
  query,
  limit = 25,
  initialLimit = INITIAL_SELECTOR_LIMIT,
  selectedColumns = [],
  filters = {},
}: {
  versionId: number | null | undefined;
  query: string;
  limit?: number;
  initialLimit?: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
}) => {
  const { showMessage } = useMessageHandler();
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const localZones = useZoneStoreQuery({
    versionId,
    query,
    limit,
    selectedColumns,
    filters,
  });
  const [isLoading, setIsLoading] = useState(false);
  const requestedQueryRef = useRef<string | null>(null);
  const hasRequestedInitialRef = useRef(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (typeof versionId !== "number") {
      setIsLoading(false);
      return;
    }

    if (localZones.length > 0) {
      setIsLoading(false);
      if (!trimmedQuery) {
        requestedQueryRef.current = null;
      }
      return;
    }

    if (!trimmedQuery && hasRequestedInitialRef.current) {
      setIsLoading(false);
      return;
    }

    const requestKey = JSON.stringify({
      q: trimmedQuery,
      s: selectedColumns,
      filters,
    });

    if (trimmedQuery && requestedQueryRef.current === requestKey) {
      setIsLoading(false);
      return;
    }

    if (trimmedQuery) {
      requestedQueryRef.current = requestKey;
    } else {
      hasRequestedInitialRef.current = true;
      requestedQueryRef.current = null;
    }

    const controller = new AbortController();
    setIsLoading(true);
    const requestLimit = trimmedQuery ? limit : initialLimit;

    searchZonesQuery({
      versionId,
      input: trimmedQuery,
      limit: requestLimit,
      selectedColumns,
      filters,
      signal: controller.signal,
    })
      .then((zones) => {
        zones.forEach((zone) => {
          upsertZone(zone);
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof ApiError ? error.message : "Unable to load zones.";
        showMessage({ status: 500, message });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    filters,
    initialLimit,
    limit,
    localZones.length,
    selectedColumns,
    showMessage,
    trimmedQuery,
    upsertZone,
    versionId,
  ]);

  const items = useMemo(() => localZones.slice(0, limit), [limit, localZones]);

  return {
    items,
    isLoading,
  };
};
