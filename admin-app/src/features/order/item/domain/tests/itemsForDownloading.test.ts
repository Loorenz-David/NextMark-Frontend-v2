import {
  itemsForDownloading,
  resolveItemLabelOrderIdentifier,
} from "../itemsForDownloading";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runItemsForDownloadingDomainTests = () => {
  assert(
    resolveItemLabelOrderIdentifier({
      order_scalar_id: 1324,
      reference_number: "EXT-900",
      external_source: "shopify",
    }) === "#EXT-900",
    "external orders should use reference number as the item label order identifier",
  );

  assert(
    resolveItemLabelOrderIdentifier({
      order_scalar_id: 1324,
      reference_number: "EXT-900",
      external_source: "",
    }) === "#1324",
    "orders without external source should use scalar id",
  );

  assert(
    resolveItemLabelOrderIdentifier({
      order_scalar_id: 1324,
      reference_number: " ",
      external_source: "shopify",
    }) === "#1324",
    "external orders without a reference number should fall back to scalar id",
  );

  assert(
    resolveItemLabelOrderIdentifier({
      order_scalar_id: 1324,
      reference_number: "#EXT-900",
      external_source: "shopify",
    }) === "#EXT-900",
    "existing identifier prefix should be preserved",
  );

  const [downloadItem] = itemsForDownloading(
    [
      {
        client_id: "item-1",
        article_number: "A-1",
        item_type: "Chair",
        order_id: 10,
        quantity: 1,
      },
    ],
    {
      order_scalar_id: 1324,
      help_to_carry: true,
      order_plan_objective: "international_shipping",
    },
  );

  assert(
    downloadItem.itemPayload.help_to_carry === true,
    "item label payload should include help_to_carry",
  );
  assert(
    downloadItem.itemPayload.order_plan_objective === "international_shipping",
    "item label payload should include order plan objective",
  );

  const multipliedItems = itemsForDownloading(
    [
      {
        client_id: "item-2",
        article_number: "CHAIR-1",
        item_type: "Chair",
        order_id: 10,
        quantity: 3,
      },
      {
        client_id: "item-3",
        article_number: "BOX-1",
        item_type: "Box",
        order_id: 10,
        quantity: 2,
      },
    ],
    null,
    null,
    null,
    {
      resolveLabelMultiplier: (itemTypeName) =>
        itemTypeName === "Chair" ? 2 : 3,
    },
  );

  assert(
    multipliedItems.length === 12,
    "label count should equal each item quantity multiplied by its item-type multiplier",
  );

  const fallbackItems = itemsForDownloading(
    [
      {
        client_id: "item-4",
        article_number: "CUSTOM-1",
        item_type: "Custom",
        order_id: 10,
        quantity: 2,
      },
    ],
    null,
    null,
    null,
    { resolveLabelMultiplier: () => 0 },
  );

  assert(
    fallbackItems.length === 2,
    "invalid resolved multipliers should default to one",
  );
};
