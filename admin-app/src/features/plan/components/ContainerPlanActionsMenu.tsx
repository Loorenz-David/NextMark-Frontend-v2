import { useState } from "react";

import { DeleteIcon } from "@/assets/icons";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { StateCard } from "@/shared/layout/StateCard";
import {
  PANEL_MENU_ROW_CLASS_NAME,
  PanelMenu,
} from "@/shared/popups/PanelMenu";

import { usePlanController } from "../controllers/plan.controller";

type ContainerPlanActionsMenuProps = {
  planId: number;
  orderCount: number;
  itemCount: number;
  stateLabel?: string | null;
  stateColor?: string | null;
  /** Closes the workspace panel once the plan it was showing is gone. */
  onDeleted?: () => void;
};

/**
 * The container plan header menu (international shipping, store pickup):
 * the plan's counts and state, then its actions. Deleting is the only action
 * for now — these plans hold a schedule and a set of orders, with none of the
 * route-operations actions to offer. Same panel menu as the route plan.
 *
 * Shared by both container workspaces rather than duplicated, and exported from
 * the plan barrel since plan deletion is a plan-feature concern.
 */
export const ContainerPlanActionsMenu = ({
  planId,
  orderCount,
  itemCount,
  stateLabel,
  stateColor,
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
    <PanelMenu ariaLabel="Plan menu">
      {(close) => (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-subtle px-4 py-3">
            <p className="min-w-0 truncate text-xs text-[var(--color-muted)]">
              {orderCount} {orderCount === 1 ? "order" : "orders"} · {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </p>
            {stateLabel ? <StateCard label={stateLabel} color={stateColor} /> : null}
          </div>
          <div className="flex flex-col p-2">
            {isDeleting ? (
              <div
                className={`${PANEL_MENU_ROW_CLASS_NAME} cursor-default text-[var(--color-muted)]`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <DeleteIcon className="h-4 w-4 text-[var(--color-muted)]" />
                </span>
                Deleting plan…
              </div>
            ) : (
              <ConfirmActionButton
                onConfirm={() => {
                  close();
                  void handleDelete();
                }}
                deleteClassName="w-full"
                deleteContent={
                  <div className={`${PANEL_MENU_ROW_CLASS_NAME} text-[var(--color-text)]`}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <DeleteIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                    </span>
                    Delete plan
                  </div>
                }
                confirmContent="Confirm delete"
                confirmClassName="flex min-h-11 w-full items-center justify-center rounded-xl bg-danger-solid px-3 text-sm text-danger-on-solid"
                duration={4000}
              />
            )}
          </div>
        </>
      )}
    </PanelMenu>
  );
};
