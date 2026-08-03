import { useState } from "react";

import { DeleteIcon } from "@/assets/icons";
import { ThreeDotMenu } from "@/shared/buttons/ThreeDotMenu";

import { usePlanController } from "../controllers/plan.controller";

type ContainerPlanActionsMenuProps = {
  planId: number;
  /** Closes the workspace panel once the plan it was showing is gone. */
  onDeleted?: () => void;
};

/**
 * Actions available on a container plan. Deleting is the only one for now —
 * international shipping and store pickup plans hold a schedule and a set of
 * orders, with none of the route-operations actions to offer.
 *
 * Shared by both container workspaces rather than duplicated, and exported from
 * the plan barrel since plan deletion is a plan-feature concern.
 */
export const ContainerPlanActionsMenu = ({
  planId,
  onDeleted,
}: ContainerPlanActionsMenuProps) => {
  const { deletePlan } = usePlanController();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      // `deletePlan` reports its own failure and rolls the plan back into the
      // store, so the panel only closes on a confirmed delete.
      const deleted = await deletePlan(planId);
      if (deleted) {
        onDeleted?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ThreeDotMenu
      dotWidth={3}
      dotHeight={3}
      renderInPortal
      dotClassName="bg-[var(--color-muted)]"
      triggerClassName="p-2 w-5 rounded-full bg-[var(--color-page)] border border-[var(--color-border)] shadow-sm cursor-pointer"
      options={[
        {
          label: isDeleting ? "Deleting plan…" : "Delete plan",
          action: () => {
            void handleDelete();
          },
          disabled: isDeleting,
          icon: <DeleteIcon className="h-4 w-4 text-[var(--color-muted)]/90" />,
          confirmation: {
            confirmContent: "Confirm delete",
            confirmClassName:
              "flex w-full items-center justify-center rounded-lg bg-danger-solid px-3 py-2 text-[10px] text-danger-on-solid",
            duration: 4000,
          },
        },
      ]}
    />
  );
};
