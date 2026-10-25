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
    <div className="order-card-items relative z-10 flex flex-col">
      {rows.map((preview, index) => (
        <div
          key={`${preview.article_number}-${index}`}
          className="order-card-item flex items-center"
        >
          {(preview.image_urls ?? []).length > 0 ? (
            <ItemImagePopover
              imageUrls={preview.image_urls}
              itemType={preview.item_type}
              thumbnailClassName="order-card-thumb rounded-xl"
            />
          ) : (
            <RemoteImage
              imageUrl={null}
              alt={
                preview.item_type
                  ? `${preview.item_type} — no image`
                  : "No item image"
              }
              className="order-card-thumb shrink-0 rounded-xl border border-border"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="order-card-article block min-w-0 truncate font-medium leading-tight text-[var(--color-text)]">
              {preview.article_number || "—"}
            </span>
            <span className="order-card-meta mt-0.5 block text-[var(--color-muted)]">
              Qty {preview.quantity ?? 1}
            </span>
            <span className="order-card-meta mt-0.5 block min-w-0 truncate text-[var(--color-muted)]">
              Position: {preview.item_position || "—"}
            </span>
          </div>
        </div>
      ))}
      {extraCount > 0 && (
        <span className="order-card-more text-[var(--color-muted)]">
          + {extraCount} more {extraCount === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
};
