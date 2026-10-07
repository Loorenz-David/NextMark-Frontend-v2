import { useDraggable } from "@dnd-kit/core";

import { BasicButton } from "@/shared/buttons/BasicButton";

type OrderBatchPlanDragButtonProps = {
  selectedCount: number;
  isLoading?: boolean;
};

export const OrderBatchPlanDragButton = ({
  selectedCount,
  isLoading = false,
}: OrderBatchPlanDragButtonProps) => {
  const isDisabled = selectedCount <= 0;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "order-batch-selection",
    disabled: isDisabled,
    data: {
      type: "order_batch",
      selectedCount,
      isLoading,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`dnd-touch-source${isDragging ? " opacity-60" : ""}`}
      style={{ cursor: isDisabled ? "not-allowed" : "grab" }}
      {...attributes}
      {...listeners}
    >
      <BasicButton
        params={{
          variant: "secondary",
          onClick: () => undefined,
          ariaLabel: "Drag selected orders to a plan",
          disabled: isDisabled,
          className: "cursor-inherit",
        }}
      >
        Drag to Plan
      </BasicButton>
    </div>
  );
};
