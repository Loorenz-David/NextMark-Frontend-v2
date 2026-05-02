import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMessageHandler } from "@shared-message-handler";

import { useItemRules } from "../../domain/useItemRules";
import { useItemActions } from "../../hooks/useItemActions";
import {
  shouldRefreshItemsForOrder,
  useItemFlow,
} from "../../hooks/useItemFlow";
import type { Item } from "../../types";
import { ItemCard } from "../ItemCard";
import { ItemsOrderPreviewDefaultLayout } from "./ItemsOrderPreviewDefault.layout";
import { ItemsOrderPreviewScrollLayout } from "./ItemsOrderPreviewScroll.layout";
import { ItemsOrderPreviewStickyLayout } from "./ItemsOrderPreviewSticky.layout";
import { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";
import { usePrintTemplates } from "@/features/templates/printDocument/store";
import { startItemLabelDownload } from "../../flows/startItemLabelDownload.flow";
import { useOrderModel } from "../../../domain/useOrderModel";
import type { availableEvents } from "@/features/templates/printDocument/types";

export type ItemsOrderPreviewProps = {
  orderId?: number;
  controlled?: boolean;
  items?: Item[];
  expectedItemCount?: number | null;
  itemsUpdatedAt?: string | null;
  header?: ReactNode;
  onAddItem?: () => void;
  onEditItem?: (item: Item) => void;
  stickyHeader?: boolean;
  scrollBody?: boolean;
};

export const ItemsOrderPreview = ({
  orderId,
  controlled = false,
  items: controlledItems,
  expectedItemCount,
  itemsUpdatedAt,
  header,
  onAddItem,
  onEditItem,
  scrollBody = false,
  stickyHeader = false,
}: ItemsOrderPreviewProps) => {
  const waitForNextPaint = async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  };

  const {
    loadItemsByOrderId,
    isLoadingItems,
    items: flowItems,
  } = useItemFlow({ orderId: orderId ?? null });
  const { openCreateItem, openEditItem } = useItemActions();
  const { calculateOrderItemStats } = useItemRules();
  const { showMessage } = useMessageHandler();
  const printTemplates = usePrintTemplates();
  const { downloadByEvent } = useDownloadTemplateByEventFlow();
  const { normalizeOrderPayload } = useOrderModel();
  const [expandedItemClientId, setExpandedItemClientId] = useState<
    string | null
  >(null);
  const [isPrintingLabels, setIsPrintingLabels] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);

  useEffect(() => {
    if (controlled || typeof orderId !== "number") return;
    if (
      !shouldRefreshItemsForOrder({
        orderId,
        itemsUpdatedAt,
        expectedItemCount,
      })
    ) {
      return;
    }
    void loadItemsByOrderId(orderId, { itemsUpdatedAt });
  }, [
    controlled,
    expectedItemCount,
    itemsUpdatedAt,
    loadItemsByOrderId,
    orderId,
  ]);

  const resolvedItems: Item[] = controlled
    ? (controlledItems ?? [])
    : flowItems;
  const resolvedLoading = controlled ? false : isLoadingItems;
  const stats = calculateOrderItemStats(resolvedItems);
  const manualPrintEvent = useMemo<Extract<
    availableEvents,
    "item_created" | "item_edited"
  > | null>(() => {
    const hasItemCreatedTemplate = printTemplates.some(
      (template) =>
        template.enable &&
        template.channel === "item" &&
        template.event === "item_created",
    );
    if (hasItemCreatedTemplate) {
      return "item_created";
    }

    const hasItemEditedTemplate = printTemplates.some(
      (template) =>
        template.enable &&
        template.channel === "item" &&
        template.event === "item_edited",
    );
    if (hasItemEditedTemplate) {
      return "item_edited";
    }

    return null;
  }, [printTemplates]);
  const showPrintAction = manualPrintEvent != null;

  useEffect(() => {
    if (expandedItemClientId == null) return;
    const currentItems = controlled ? (controlledItems ?? []) : flowItems;
    const stillExists = currentItems.some(
      (entry) => entry.client_id === expandedItemClientId,
    );
    if (!stillExists) {
      setExpandedItemClientId(null);
    }
  }, [controlled, controlledItems, expandedItemClientId, flowItems]);

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem();
      return;
    }

    if (typeof orderId !== "number") return;
    openCreateItem(orderId);
  };

  const handlePrintLabels = async () => {
    if (!manualPrintEvent) {
      return;
    }

    if (isPrintingLabels) {
      return;
    }

    if (typeof orderId !== "number") {
      showMessage({
        status: 400,
        message: "Order id is required to print labels.",
      });
      return;
    }

    let itemsToPrint = resolvedItems;
    if (
      !controlled &&
      shouldRefreshItemsForOrder({
        orderId,
        itemsUpdatedAt,
        expectedItemCount,
      })
    ) {
      const normalized = await loadItemsByOrderId(orderId, { itemsUpdatedAt });
      if (normalized) {
        itemsToPrint = normalized.allIds
          .map((clientId) => normalized.byClientId[clientId])
          .filter((item): item is Item => Boolean(item));
      }
    }

    if (itemsToPrint.length === 0) {
      showMessage({
        status: 400,
        message: "No items available to print labels.",
      });
      return;
    }

    setIsPrintingLabels(true);
    setPrintProgress(0.02);
    try {
      await waitForNextPaint();
      await startItemLabelDownload({
        downloadByEvent,
        event: manualPrintEvent,
        items: itemsToPrint,
        normalizeOrderPayload,
        orderId,
        onProgress: (progress) => {
          const clampedProgress = Math.max(0, Math.min(1, progress));
          setPrintProgress((currentProgress) =>
            Math.max(currentProgress, clampedProgress),
          );
        },
      });
    } finally {
      setPrintProgress(0);
      setIsPrintingLabels(false);
    }
  };

  const commonLayoutProps = {
    header,
    resolvedLoading,
    resolvedItems,
    showPrintAction,
    disablePrintAction:
      resolvedLoading || resolvedItems.length === 0 || isPrintingLabels,
    isPrintActionLoading: isPrintingLabels,
    printProgress,
    onPrintLabels: () => {
      void handlePrintLabels();
    },
    controlled,
    expandedItemClientId,
    onToggleExpand: (clientId: string) => {
      setExpandedItemClientId((current) =>
        current === clientId ? null : clientId,
      );
    },
    onEditItem,
    orderId,
    onOpenEditItem: openEditItem,
    onAddItem: handleAddItem,
    totalItems: stats.totalItems,
    totalWeight: stats.totalWeight,
    totalVolume: stats.totalVolume,
    testNodes: [],
  };

  if (stickyHeader) {
    return (
      <ItemsOrderPreviewStickyLayout
        {...commonLayoutProps}
        enableScrollBody={scrollBody}
      />
    );
  }

  if (scrollBody) {
    return <ItemsOrderPreviewScrollLayout {...commonLayoutProps} />;
  }

  return <ItemsOrderPreviewDefaultLayout {...commonLayoutProps} />;
};
