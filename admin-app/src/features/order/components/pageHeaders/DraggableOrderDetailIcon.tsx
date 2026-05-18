import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { DocumentIcon } from "@/assets/icons";
import type { Order } from "@/features/order/types/order";

type DraggableOrderDetailIconProps = {
  order: Order;
};

export const DraggableOrderDetailIcon = ({
  order,
}: DraggableOrderDetailIconProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `order-detail-header-${order.client_id}`,
      data: {
        type: "order",
        id: order.client_id,
        dragSource: "order_detail_header",
        order,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    visibility: isDragging ? "hidden" : "visible",
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/12 bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[0_12px_28px_rgba(131,204,185,0.1)]"
      {...attributes}
      {...listeners}
    >
      <DocumentIcon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
    </div>
  );
};
