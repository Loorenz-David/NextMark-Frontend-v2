import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";

import type { Order } from "@/features/order/types/order";

type DraggableOrderDetailHandleProps = {
  order: Order;
  children: ReactNode;
  className?: string;
};

/** Makes its children a drag handle that carries the open order onto plans. */
export const DraggableOrderDetailHandle = ({
  order,
  children,
  className,
}: DraggableOrderDetailHandleProps) => {
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
      className={`dnd-touch-source ${className ?? ""}`.trim()}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};
