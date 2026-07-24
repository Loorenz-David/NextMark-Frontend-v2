import { create } from "zustand";

import type {
  ManualMessageOption,
  OrderEventActionStatus,
  SendableChannel,
  TrackedManualMessageAction,
  TrackedManualMessageSend,
} from "../types/manualMessage";

type TrackedSendsByEvent = Record<string, TrackedManualMessageSend>;

type ManualMessageState = {
  /** Templates are team-scoped, so options are shared across every mounted field. */
  options: ManualMessageOption[];
  optionsLoaded: boolean;
  optionsLoading: boolean;
  trackedByOrderId: Record<number, TrackedSendsByEvent>;
  sendingByOrderId: Record<number, string | null>;

  setOptionsLoading: (loading: boolean) => void;
  setOptions: (options: ManualMessageOption[]) => void;
  setSendingEvent: (orderId: number, templateEvent: string | null) => void;
  replaceTrackedSends: (orderId: number, tracked: TrackedSendsByEvent) => void;
  upsertTrackedSend: (
    orderId: number,
    templateEvent: string,
    patch: Partial<TrackedManualMessageSend>,
  ) => void;
  seedTrackedSend: (
    orderId: number,
    templateEvent: string,
    seed: Omit<TrackedManualMessageSend, "templateEvent" | "notFound">,
  ) => void;
  upsertTrackedAction: (
    orderId: number,
    templateEvent: string,
    action: TrackedManualMessageAction,
  ) => void;
};

const emptyTrackedSend = (templateEvent: string): TrackedManualMessageSend => ({
  templateEvent,
  requestId: null,
  eventId: null,
  actionsById: {},
  skippedChannels: [],
  notFound: false,
});

export const useManualMessageStore = create<ManualMessageState>((set) => ({
  options: [],
  optionsLoaded: false,
  optionsLoading: false,
  trackedByOrderId: {},
  sendingByOrderId: {},

  setOptionsLoading: (loading) => set({ optionsLoading: loading }),

  setOptions: (options) =>
    set({ options, optionsLoaded: true, optionsLoading: false }),

  setSendingEvent: (orderId, templateEvent) =>
    set((state) => ({
      sendingByOrderId: {
        ...state.sendingByOrderId,
        [orderId]: templateEvent,
      },
    })),

  replaceTrackedSends: (orderId, tracked) =>
    set((state) => ({
      trackedByOrderId: {
        ...state.trackedByOrderId,
        [orderId]: tracked,
      },
    })),

  upsertTrackedSend: (orderId, templateEvent, patch) =>
    set((state) => {
      const forOrder = state.trackedByOrderId[orderId] ?? {};
      const existing = forOrder[templateEvent] ?? emptyTrackedSend(templateEvent);

      return {
        trackedByOrderId: {
          ...state.trackedByOrderId,
          [orderId]: {
            ...forOrder,
            [templateEvent]: { ...existing, ...patch },
          },
        },
      };
    }),

  /**
   * Applies the send response.
   *
   * A worker can settle an action before the HTTP call resolves, so entries
   * already written by a realtime frame win over the seeded PENDING ones. A
   * resend (a genuinely different event id) replaces the previous outcome
   * outright instead of merging into it.
   */
  seedTrackedSend: (orderId, templateEvent, seed) =>
    set((state) => {
      const forOrder = state.trackedByOrderId[orderId] ?? {};
      const existing = forOrder[templateEvent];
      const belongsToThisSend =
        existing != null &&
        (existing.eventId === null || existing.eventId === seed.eventId);

      return {
        trackedByOrderId: {
          ...state.trackedByOrderId,
          [orderId]: {
            ...forOrder,
            [templateEvent]: {
              templateEvent,
              requestId: seed.requestId,
              eventId: seed.eventId,
              skippedChannels: seed.skippedChannels,
              notFound: false,
              actionsById: belongsToThisSend
                ? { ...seed.actionsById, ...existing.actionsById }
                : seed.actionsById,
            },
          },
        },
      };
    }),

  upsertTrackedAction: (orderId, templateEvent, action) =>
    set((state) => {
      const forOrder = state.trackedByOrderId[orderId] ?? {};
      const existing = forOrder[templateEvent] ?? emptyTrackedSend(templateEvent);
      const current = existing.actionsById[action.actionId];

      // SUCCESS / FAILED / SKIPPED are terminal. A late PENDING write — a
      // dispatched frame overtaken by its own updated frame — must not undo one.
      if (current && current.status !== "PENDING" && action.status === "PENDING") {
        return state;
      }

      return {
        trackedByOrderId: {
          ...state.trackedByOrderId,
          [orderId]: {
            ...forOrder,
            [templateEvent]: {
              ...existing,
              actionsById: {
                ...existing.actionsById,
                [action.actionId]: action,
              },
            },
          },
        },
      };
    }),
}));

const EMPTY_TRACKED: TrackedSendsByEvent = {};

export const useManualMessageOptions = () =>
  useManualMessageStore((state) => state.options);

export const useManualMessageOptionsLoaded = () =>
  useManualMessageStore((state) => state.optionsLoaded);

export const useManualMessageOptionsLoading = () =>
  useManualMessageStore((state) => state.optionsLoading);

export const useTrackedManualMessages = (orderId: number | null | undefined) =>
  useManualMessageStore((state) =>
    typeof orderId === "number"
      ? (state.trackedByOrderId[orderId] ?? EMPTY_TRACKED)
      : EMPTY_TRACKED,
  );

export const useManualMessageSendingEvent = (
  orderId: number | null | undefined,
) =>
  useManualMessageStore((state) =>
    typeof orderId === "number"
      ? (state.sendingByOrderId[orderId] ?? null)
      : null,
  );

export const getTrackedManualMessages = (orderId: number) =>
  useManualMessageStore.getState().trackedByOrderId[orderId] ?? EMPTY_TRACKED;

export const setManualMessageOptions = (options: ManualMessageOption[]) =>
  useManualMessageStore.getState().setOptions(options);

export const setManualMessageOptionsLoading = (loading: boolean) =>
  useManualMessageStore.getState().setOptionsLoading(loading);

export const setManualMessageSendingEvent = (
  orderId: number,
  templateEvent: string | null,
) => useManualMessageStore.getState().setSendingEvent(orderId, templateEvent);

export const replaceTrackedManualMessages = (
  orderId: number,
  tracked: TrackedSendsByEvent,
) => useManualMessageStore.getState().replaceTrackedSends(orderId, tracked);

export const upsertTrackedManualMessage = (
  orderId: number,
  templateEvent: string,
  patch: Partial<TrackedManualMessageSend>,
) =>
  useManualMessageStore
    .getState()
    .upsertTrackedSend(orderId, templateEvent, patch);

export const seedTrackedManualMessage = (
  orderId: number,
  templateEvent: string,
  seed: Omit<TrackedManualMessageSend, "templateEvent" | "notFound">,
) =>
  useManualMessageStore.getState().seedTrackedSend(orderId, templateEvent, seed);

export const upsertTrackedManualMessageAction = (
  orderId: number,
  templateEvent: string,
  action: {
    actionId: number;
    channel: SendableChannel | null;
    status: OrderEventActionStatus;
    lastError?: string | null;
    processedAt?: string | null;
  },
) =>
  useManualMessageStore.getState().upsertTrackedAction(orderId, templateEvent, {
    actionId: action.actionId,
    channel: action.channel,
    status: action.status,
    lastError: action.lastError ?? null,
    processedAt: action.processedAt ?? null,
  });
