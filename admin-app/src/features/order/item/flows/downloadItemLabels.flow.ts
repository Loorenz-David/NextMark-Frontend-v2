import {
  createItemTypeLabelMultiplierResolver,
  ensureItemTypesLoaded,
} from "@/features/itemConfigurations";
import type { ItemType } from "@/features/itemConfigurations";
import type {
  availableEvents,
  useDownloadTemplateByEventFlow,
} from "@/features/templates/printDocument";

import {
  itemsForDownloading,
  resolveItemLabelFileName,
} from "../domain/itemsForDownloading";
import type { OrderLabelIdentifierSource } from "../domain/itemsForDownloading";
import type { Item } from "../types";

type DownloadByEvent = ReturnType<
  typeof useDownloadTemplateByEventFlow
>["downloadByEvent"];

type ItemLabelEvent = Extract<
  availableEvents,
  "item_created" | "item_edited" | "item_rescheduled"
>;

export const downloadItemLabels = async ({
  downloadByEvent,
  event,
  items,
  orderIdentifier,
  routePlanId,
  orderNotes,
  onProgress,
}: {
  downloadByEvent: DownloadByEvent;
  event: ItemLabelEvent;
  items: Item[];
  orderIdentifier?: OrderLabelIdentifierSource | number | null;
  routePlanId?: number | null;
  orderNotes?: unknown;
  onProgress?: (progress: number) => void;
}): Promise<void> => {
  let itemTypes: ItemType[] = [];

  try {
    itemTypes = await ensureItemTypesLoaded();
  } catch {
    // Preserve label printing when item-type configuration is unavailable.
    // The resolver defaults every item type to a multiplier of one.
  }

  const resolveLabelMultiplier =
    createItemTypeLabelMultiplierResolver(itemTypes);
  const data = itemsForDownloading(
    items,
    orderIdentifier,
    routePlanId,
    orderNotes,
    { resolveLabelMultiplier },
  );

  if (data.length === 0) return;

  await downloadByEvent({
    channel: "item",
    event,
    data,
    fileName: resolveItemLabelFileName(
      typeof orderIdentifier === "object" ? orderIdentifier : null,
    ),
    onProgress,
  });
};
