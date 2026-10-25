import { RemoteImage } from "@/shared/media/RemoteImage";

import type { Order } from "../../types/order";
import { ItemImagePopover } from "../../item/components/ItemCard/ItemImagePopover";
import { resolveOrderItemPreviewSummary } from "../../domain/orderItemPreviewSummary";

type OrderCardItemPreviewsProps = {
  previews: Order["item_previews"];
  totalItems: number;
};

export const OrderCardItemPreviews = ({
  previews,
  totalItems,
}: OrderCardItemPreviewsProps) => {
  const { rows, extraCount } = resolveOrderItemPreviewSummary(previews, totalItems);

  if (rows.length === 0) return null;

  return (
    <div className="relative z-10 flex flex-col gap-3">
      {rows.map((preview, index) => (
        <div
          key={`${preview.article_number}-${index}`}
          className="flex items-center gap-3"
        >
          {(preview.image_urls ?? []).length > 0 ? (
            <ItemImagePopover
              imageUrls={preview.image_urls}
              itemType={preview.item_type}
              thumbnailClassName="h-16 w-16 rounded-xl"
            />
          ) : (
            <RemoteImage
              imageUrl={null}
              alt={
                preview.item_type
                  ? `${preview.item_type} — no image`
                  : "No item image"
              }
              className="h-16 w-16 shrink-0 rounded-xl border border-border"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="block min-w-0 truncate text-lg font-medium leading-tight text-[var(--color-text)]">
              {preview.article_number || "—"}
            </span>
            <span className="mt-0.5 block text-sm text-[var(--color-muted)]">
              Qty {preview.quantity ?? 1}
            </span>
            <span className="mt-0.5 block min-w-0 truncate text-sm text-[var(--color-muted)]">
              Position: {preview.item_position || "—"}
            </span>
          </div>
        </div>
      ))}
      {extraCount > 0 && (
        <span className="pl-[76px] text-sm text-[var(--color-muted)]">
          + {extraCount} more {extraCount === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
};
