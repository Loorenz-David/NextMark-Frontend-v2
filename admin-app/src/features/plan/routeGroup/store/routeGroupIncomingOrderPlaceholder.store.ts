import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { buildClientId } from "@/lib/utils/clientId";

type IncomingOrderPlaceholderEntry = {
  token: string;
  count: number;
};

type RouteGroupIncomingOrderPlaceholderState = {
  entriesByPlanId: Record<number, IncomingOrderPlaceholderEntry[]>;
  addPlaceholders: (
    planId: number | null | undefined,
    count: number,
  ) => string | null;
  removePlaceholders: (
    planId: number | null | undefined,
    token: string | null | undefined,
  ) => void;
};

const normalizePlanId = (planId: number | null | undefined) =>
  typeof planId === "number" && Number.isFinite(planId) && planId > 0
    ? planId
    : null;

const normalizeCount = (count: number) =>
  Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

const DEV = import.meta.env.DEV

const logPlaceholderState = (
  event: string,
  params: {
    planId: number | null
    token?: string | null
    count?: number
    entriesByPlanId: Record<number, IncomingOrderPlaceholderEntry[]>
  },
) => {
  if (!DEV) {
    return
  }

  const summary = Object.fromEntries(
    Object.entries(params.entriesByPlanId).map(([planId, entries]) => [
      planId,
      {
        entryCount: entries.length,
        placeholderCount: entries.reduce((total, entry) => total + entry.count, 0),
        tokens: entries.map((entry) => entry.token),
      },
    ]),
  )

  console.debug(`[route-group-placeholders] ${event}`, {
    planId: params.planId,
    token: params.token ?? null,
    count: params.count ?? null,
    summary,
  })
}

export const useRouteGroupIncomingOrderPlaceholderStore =
  create<RouteGroupIncomingOrderPlaceholderState>((set) => ({
    entriesByPlanId: {},
    addPlaceholders: (planId, count) => {
      const normalizedPlanId = normalizePlanId(planId);
      const normalizedCount = normalizeCount(count);
      if (!normalizedPlanId || normalizedCount === 0) {
        return null;
      }

      const token = buildClientId("incoming-route-group-order");
      set((state) => {
        const entriesByPlanId = {
          ...state.entriesByPlanId,
          [normalizedPlanId]: [
            ...(state.entriesByPlanId[normalizedPlanId] ?? []),
            { token, count: normalizedCount },
          ],
        }

        logPlaceholderState('add', {
          planId: normalizedPlanId,
          token,
          count: normalizedCount,
          entriesByPlanId,
        })

        return { entriesByPlanId }
      });
      return token;
    },
    removePlaceholders: (planId, token) => {
      const normalizedPlanId = normalizePlanId(planId);
      if (!normalizedPlanId || !token) return;

      set((state) => {
        const currentEntries = state.entriesByPlanId[normalizedPlanId] ?? [];
        if (currentEntries.length === 0) {
          return state;
        }

        const nextEntries = currentEntries.filter((entry) => entry.token !== token);
        if (nextEntries.length === currentEntries.length) {
          return state;
        }

        const nextEntriesByPlanId = { ...state.entriesByPlanId };
        if (nextEntries.length === 0) {
          delete nextEntriesByPlanId[normalizedPlanId];
        } else {
          nextEntriesByPlanId[normalizedPlanId] = nextEntries;
        }

        logPlaceholderState('remove', {
          planId: normalizedPlanId,
          token,
          entriesByPlanId: nextEntriesByPlanId,
        })

        return { entriesByPlanId: nextEntriesByPlanId };
      });
    },
  }));

export const registerIncomingRouteGroupOrderPlaceholders = (
  planId: number | null | undefined,
  count: number,
) =>
  useRouteGroupIncomingOrderPlaceholderStore
    .getState()
    .addPlaceholders(planId, count);

export const clearIncomingRouteGroupOrderPlaceholders = (
  planId: number | null | undefined,
  token: string | null | undefined,
) =>
  useRouteGroupIncomingOrderPlaceholderStore
    .getState()
    .removePlaceholders(planId, token);

export const useIncomingRouteGroupOrderPlaceholderKeys = (
  planId: number | null | undefined,
) =>
  useRouteGroupIncomingOrderPlaceholderStore(
    useShallow((state) => {
      const normalizedPlanId = normalizePlanId(planId);
      if (!normalizedPlanId) return [];

      const entries = state.entriesByPlanId[normalizedPlanId] ?? [];
      return entries.flatMap((entry) =>
        Array.from(
          { length: normalizeCount(entry.count) },
          (_, index) => `${entry.token}:${index}`,
        ),
      );
    }),
  );
