import type { ReactNode } from "react";

import { RemoteImage } from "@/shared/media/RemoteImage";

import type { Order } from "../../types/order";

type OrderDragOverlayCardProps = {
  order: Order;
  orderNumberAddon?: ReactNode;
};

export const OrderDragOverlayCard = ({
  order,
  orderNumberAddon,
}: OrderDragOverlayCardProps) => {
  const orderLabel =
    order.external_source && order.reference_number
      ? order.reference_number
      : order.order_scalar_id != null
        ? `#${order.order_scalar_id}`
        : "#—";
  const itemCount = order.total_items ?? 0;
  const previewItems = (order.item_previews ?? []).slice(0, 2);

  return (
    <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5 shadow-lg">
      <div className="flex min-w-[88px] flex-col">
        <div className="flex items-center gap-2">
          {orderNumberAddon}
          <span className="text-base font-semibold leading-tight text-[var(--color-text)]">
            {orderLabel}
          </span>
        </div>
        <span className="mt-1 text-xs text-[var(--color-muted)]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {previewItems.length > 0 ? (
        <div className="flex shrink-0 items-center gap-2">
          {previewItems.map((preview, index) => (
            <RemoteImage
              key={`${preview.article_number}-${index}`}
              imageUrl={preview.image_urls?.[0] ?? null}
              alt={
                preview.item_type
                  ? `${preview.item_type} item`
                  : "Order item preview"
              }
              widths={[48, 96]}
              sizes="48px"
              className="h-12 w-12 shrink-0 rounded-lg border border-border"
              loading="eager"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
