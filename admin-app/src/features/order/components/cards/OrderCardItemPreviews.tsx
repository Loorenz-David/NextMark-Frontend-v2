import { RemoteImage } from "@/shared/media/RemoteImage";

import type { Order } from "../../types/order";
import { ItemImagePopover } from "../../item/components/ItemCard/ItemImagePopover";

type OrderCardItemPreviewsProps = {
  previews: Order["item_previews"];
  totalItems: number;
};

export const OrderCardItemPreviews = ({
  previews,
  totalItems,
}: OrderCardItemPreviewsProps) => {
  const previewList = previews ?? [];

  if (previewList.length === 0) return null;

  // totalItems counts quantity units; subtract the units covered by the
  // previewed groups so "+N more" reflects what is actually not shown.
  const previewedUnits = previewList.reduce(
    (sum, preview) => sum + (preview.quantity ?? 1),
    0,
  );
  const extraCount = Math.max(0, totalItems - previewedUnits);

  return (
    <div className="relative z-10 flex flex-col gap-2">
      {previewList.map((preview, index) => (
        <div
          key={`${preview.article_number}-${index}`}
          className="flex items-center gap-3"
        >
          {(preview.image_urls ?? []).length > 0 ? (
            <ItemImagePopover
              imageUrls={preview.image_urls}
              itemType={preview.item_type}
            />
          ) : (
            <RemoteImage
              imageUrl={null}
              alt={
                preview.item_type
                  ? `${preview.item_type} — no image`
                  : "No item image"
              }
              className="h-14 w-14 shrink-0 rounded-md border border-border"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="block min-w-0 truncate text-sm text-[var(--color-text)]">
              {preview.article_number || "—"}
            </span>
            <span className="mt-0.5 block min-w-0 truncate text-xs text-[var(--color-muted)]/95">
              Position: {preview.item_position || "—"}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]/95">
              Qty: {preview.quantity ?? 1}
            </span>
          </div>
        </div>
      ))}
      {extraCount > 0 && (
        <span className="pl-[68px] text-xs text-[var(--color-muted)]/90">
          + {extraCount} more {extraCount === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
};
