import { useDraggable } from "@dnd-kit/core";

import { DocumentIcon } from "@/assets/icons";
import type { Order } from "@/features/order/types/order";

type DraggableOrderDetailIconProps = {
  order: Order;
};

export const DraggableOrderDetailIcon = ({
  order,
}: DraggableOrderDetailIconProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `order-detail-header-${order.client_id}`,
    data: {
      type: "order",
      id: order.client_id,
      dragSource: "order_detail_header",
      order,
    },
  });

  // The DragOverlay tracks the pointer; the source hides in place — via
  // wrapper `opacity` so no descendant `transition-all` can delay the flip.
  const style = {
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? "hidden" : "visible",
    pointerEvents: isDragging ? "none" : undefined,
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[var(--shadow-button-accent-subtle)]"
      {...attributes}
      {...listeners}
    >
      <DocumentIcon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
    </div>
  );
};
