import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deriveManualMessageCardStatus,
  filterManualMessageOptions,
  hasPendingManualMessage,
  readManualMessageError,
  summarizeManualMessageChannels,
} from "../domain";
import { useManualMessageFallbackPoll } from "../flows/manualMessageFallbackPoll.flow";
import { useManualMessageFlow } from "../flows/manualMessage.flow";
import { useManualMessageRealtime } from "../realtime/useManualMessageRealtime";
import {
  useManualMessageOptions,
  useManualMessageOptionsLoaded,
  useManualMessageOptionsLoading,
  useManualMessageSendingEvent,
  useTrackedManualMessages,
} from "../store/manualMessage.store";
import type {
  ManualMessageCardStatus,
  SendableChannel,
} from "../types/manualMessage";

export type ManualMessageRow = {
  event: string;
  label: string;
  channels: SendableChannel[];
  status: ManualMessageCardStatus;
  detail: string | null;
  error: string | null;
  isSelected: boolean;
};

type UseManualMessageControllerOptions = {
  orderId: number | null;
};

export const useManualMessageController = ({
  orderId,
}: UseManualMessageControllerOptions) => {
  const { loadTemplateOptions, refreshManualMessageStatus, sendManualMessage } =
    useManualMessageFlow();

  const options = useManualMessageOptions();
  const optionsLoaded = useManualMessageOptionsLoaded();
  const optionsLoading = useManualMessageOptionsLoading();
  const tracked = useTrackedManualMessages(orderId);
  const sendingEvent = useManualMessageSendingEvent(orderId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [pollToken, setPollToken] = useState(0);

  // Templates change on the Messages settings page, which cannot reach this
  // store. Mounting the field is the boundary where it must catch up, so every
  // open revalidates the cached options instead of trusting them forever.
  useEffect(() => {
    void loadTemplateOptions({ revalidate: true });
  }, [loadTemplateOptions]);

  useEffect(() => {
    if (typeof orderId !== "number") return;
    void refreshManualMessageStatus(orderId);
  }, [orderId, refreshManualMessageStatus]);

  useManualMessageRealtime({ orderId });

  const hasPending = useMemo(
    () => Object.values(tracked).some(hasPendingManualMessage),
    [tracked],
  );

  useManualMessageFallbackPoll({
    orderId,
    hasPending,
    pollToken,
    refresh: refreshManualMessageStatus,
  });

  const rows = useMemo<ManualMessageRow[]>(() => {
    return filterManualMessageOptions(options, searchQuery).map((option) => {
      const trackedSend = tracked[option.event] ?? null;
      // The request is in flight and has no action rows yet. Spin now rather
      // than after the response, and drop any outcome from a previous send.
      const isInFlight = sendingEvent === option.event;

      return {
        event: option.event,
        label: option.label,
        channels: option.channels,
        status: isInFlight
          ? "sending"
          : deriveManualMessageCardStatus(trackedSend),
        detail: isInFlight ? null : summarizeManualMessageChannels(trackedSend),
        error: isInFlight ? null : readManualMessageError(trackedSend),
        isSelected: selectedEvent === option.event,
      };
    });
  }, [options, searchQuery, selectedEvent, sendingEvent, tracked]);

  const selectEvent = useCallback((event: string) => {
    setSelectedEvent((current) => (current === event ? null : event));
  }, []);

  const send = useCallback(async () => {
    if (typeof orderId !== "number" || !selectedEvent) return;

    const sent = await sendManualMessage(orderId, selectedEvent);
    if (sent) {
      setPollToken((token) => token + 1);
    }
  }, [orderId, selectedEvent, sendManualMessage]);

  return {
    rows,
    searchQuery,
    setSearchQuery,
    selectedEvent,
    selectEvent,
    send,
    isSending: sendingEvent !== null,
    sendingEvent,
    canSend:
      typeof orderId === "number" && selectedEvent !== null && !sendingEvent,
    isLoading: optionsLoading && !optionsLoaded,
    isEmpty: optionsLoaded && options.length === 0,
    hasNoSearchResults:
      optionsLoaded && options.length > 0 && rows.length === 0,
  };
};

export type ManualMessageController = ReturnType<
  typeof useManualMessageController
>;
