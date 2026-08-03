import { useCallback, useEffect, useRef } from "react";

import { ExclamationIcon } from "@/assets/icons";
import { PLAN_TYPE_LABELS } from "@/features/plan/domain/planType";
import type { RoutePlanObjective } from "@/features/plan/types/plan";
import { BasicButton } from "@/shared/buttons/BasicButton";
import {
  FeaturePopupBody,
  FeaturePopupFooter,
  FeaturePopupHeader,
  FeaturePopupShell,
} from "@/shared/popups/featurePopup";
import type { StackComponentProps } from "@/shared/stack-manager/types";

export type PlanObjectiveMismatchDecision =
  | { kind: "cancel" }
  | { kind: "move_anyway" };

export type PlanObjectiveMismatchOrderSummary = {
  label: string;
  objective: RoutePlanObjective;
};

export type PlanObjectiveMismatchPopupPayload = {
  targetPlanType: RoutePlanObjective;
  /** Null when the drop creates the plan, so there is no label to name yet. */
  targetPlanLabel: string | null;
  /** Only the orders that disagree, in drag order. */
  orders: PlanObjectiveMismatchOrderSummary[];
  onDecision: (decision: PlanObjectiveMismatchDecision) => void;
};

const MAX_LISTED_ORDERS = 6;

export const PlanObjectiveMismatchPopup = ({
  payload,
  onClose,
}: StackComponentProps<PlanObjectiveMismatchPopupPayload>) => {
  const settledRef = useRef(false);

  const settle = useCallback(
    (decision: PlanObjectiveMismatchDecision) => {
      if (settledRef.current || !payload) return;
      settledRef.current = true;
      payload.onDecision(decision);
    },
    [payload],
  );

  const closeWithDecision = useCallback(
    (decision: PlanObjectiveMismatchDecision) => {
      settle(decision);
      onClose?.();
    },
    [onClose, settle],
  );

  // Dismissing the popup any other way — backdrop, Escape, a parent unmount —
  // must not silently move the orders.
  useEffect(
    () => () => {
      settle({ kind: "cancel" });
    },
    [settle],
  );

  if (!payload) {
    throw new Error("PlanObjectiveMismatchPopup payload is missing.");
  }

  const { orders, targetPlanType, targetPlanLabel } = payload;
  const targetTypeLabel = PLAN_TYPE_LABELS[targetPlanType];
  const isSingleOrder = orders.length === 1;
  const listedOrders = orders.slice(0, MAX_LISTED_ORDERS);
  const hiddenOrderCount = orders.length - listedOrders.length;

  const destinationLabel = targetPlanLabel
    ? `${targetPlanLabel} (${targetTypeLabel})`
    : `a new ${targetTypeLabel} plan`;

  return (
    <FeaturePopupShell
      onRequestClose={() => closeWithDecision({ kind: "cancel" })}
      size="mdNoHeight"
      variant="center"
    >
      <FeaturePopupHeader
        title={
          isSingleOrder
            ? "This order was planned for something else"
            : "Some orders were planned for something else"
        }
        subtitle={destinationLabel}
        onClose={() => closeWithDecision({ kind: "cancel" })}
      />

      <FeaturePopupBody className="flex flex-col bg-surface-raised">
        <div className="flex flex-col gap-4 px-4 py-5 md:px-5">
          <div className="flex gap-3 rounded-2xl border border-warning-border bg-warning-bg px-4 py-3">
            <ExclamationIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm text-[var(--color-text)]">
              {isSingleOrder
                ? `Moving it to ${destinationLabel} changes its objective to ${targetTypeLabel}.`
                : `Moving them to ${destinationLabel} changes their objective to ${targetTypeLabel}.`}
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {listedOrders.map((order, index) => (
              <li
                key={`${order.label}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--surface-card-muted)] px-3 py-2"
              >
                <span className="truncate text-sm text-[var(--color-text)]">
                  {order.label}
                </span>
                <span className="shrink-0 text-xs text-[var(--color-muted)]">
                  {PLAN_TYPE_LABELS[order.objective]} → {targetTypeLabel}
                </span>
              </li>
            ))}
          </ul>

          {hiddenOrderCount > 0 ? (
            <p className="text-xs text-[var(--color-muted)]">
              and {hiddenOrderCount} more
            </p>
          ) : null}
        </div>
      </FeaturePopupBody>

      <FeaturePopupFooter>
        <BasicButton
          params={{
            variant: "secondary",
            className: "px-4 py-2",
            onClick: () => closeWithDecision({ kind: "cancel" }),
            ariaLabel: "Cancel the move",
          }}
        >
          Cancel
        </BasicButton>
        <BasicButton
          params={{
            variant: "primary",
            className: "px-4 py-2",
            onClick: () => closeWithDecision({ kind: "move_anyway" }),
            ariaLabel: "Move anyway",
          }}
        >
          Move anyway
        </BasicButton>
      </FeaturePopupFooter>
    </FeaturePopupShell>
  );
};
