import { AnimatePresence, motion } from "framer-motion";
import { useDndContext, useDroppable } from "@dnd-kit/core";

import { ChevronDownIcon, PlanIcon, PlusIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { useResourceManager } from "@/shared/resource-manager/useResourceManager";
import type {
  KnownResourceRegistry,
  UnscheduleDropFeedback,
} from "@/shared/resource-manager/ResourceManagerContext";
import type { PlanQueryFilters, PlanStats } from "../../types/planMeta";
import { pluralLabel } from "@shared-utils";
import { InfoHover } from "@/shared/layout/InfoHover";
import { PLAN_MAIN_HEADER_INFO } from "../../info/planMainHeader.info";
import { PlanDateFilterBar } from "../planDateFilter";
import type { PlanDateFilterPayload } from "../planDateFilter";

const isOrderDragActive = (activeDrag: unknown) => {
  if (!activeDrag || typeof activeDrag !== "object") return false;
  const dragType = String((activeDrag as { type?: unknown }).type ?? "");
  return (
    dragType === "order" ||
    dragType === "order_batch" ||
    dragType === "order_group" ||
    dragType === "route_stop" ||
    dragType === "route_stop_group"
  );
};

const UnscheduleDropTarget = ({
  dropFeedback,
}: {
  dropFeedback?: UnscheduleDropFeedback | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "unschedule-drop-target",
    data: {
      type: "unschedule",
      id: "unschedule",
    },
  });

  const isSuccessFeedback = dropFeedback?.status === "success";
  const isErrorFeedback = dropFeedback?.status === "error";
  const hasFeedback = Boolean(dropFeedback);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[132px] rounded-xl border px-3 py-2 text-center transition-all duration-200 ${
        isOver || isSuccessFeedback
          ? "border-[#0B8A3D]/50 bg-[#0B8A3D]/12 shadow-[0_0_0_1px_rgba(11,138,61,0.2),0_0_16px_rgba(11,138,61,0.15)]"
          : isErrorFeedback
            ? "border-[#B42318]/35 bg-[#B42318]/10"
            : "border-[var(--color-border)] bg-[var(--color-muted)]/8"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hasFeedback ? (
          <motion.span
            key={dropFeedback?.token}
            initial={{ y: 7, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -7, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`inline-flex text-xs font-semibold uppercase tracking-[0.18em] ${
              isErrorFeedback ? "text-[#B42318]" : "text-[#0B8A3D]"
            }`}
          >
            {isErrorFeedback
              ? "Move failed"
              : `${dropFeedback?.movedCount ?? 0} moved`}
          </motion.span>
        ) : (
          <motion.span
            key="unschedule-label"
            initial={{ y: 7, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -7, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
          >
            Unschedule
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

type PlanMainHeaderProps = {
  onCreate: () => void;
  applySearch: (input: string) => void;
  applyFilters: (filters: PlanQueryFilters) => void;
  applyFilterSelection?: (payload: PlanDateFilterPayload) => void;
  onRequestClose?: () => void;
  planStats?: PlanStats;
  showCloseButton?: boolean;
};

export const PlanMainHeader = ({
  onCreate,
  applyFilters,
  applyFilterSelection,
  onRequestClose,
  showCloseButton = true,
  planStats,
}: PlanMainHeaderProps) => {
  const { active } = useDndContext();
  const { unscheduleDropFeedback } =
    useResourceManager<KnownResourceRegistry>();
  const shouldShowUnscheduleDropTarget =
    isOrderDragActive(active?.data.current) || Boolean(unscheduleDropFeedback);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/10 px-2 py-2">
            <PlanIcon className="h-8 w-8 fill-[var(--color-muted)]" />
          </div>
          <HeaderTitle planStats={planStats} />
        </div>

        {showCloseButton ? (
          <HeaderButtons onRequestClose={onRequestClose} />
        ) : null}
      </div>

      <div className="flex items-center gap-1 p-4">
        <div className="flex items-center gap-4">
          <BasicButton
            key="order-main-create"
            params={{
              variant: "primary",
              onClick: onCreate,
              ariaLabel: "Create order",
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4 stroke-[var(--color-secondary)]" />
            Plan
          </BasicButton>

          <PlanDateFilterBar
            onFiltersChange={applyFilters}
            onSelectionChange={applyFilterSelection}
          />
        </div>

        {shouldShowUnscheduleDropTarget ? (
          <UnscheduleDropTarget dropFeedback={unscheduleDropFeedback} />
        ) : null}
      </div>
    </>
  );
};

type ButtonsProps = {
  onRequestClose?: () => void;
};
const HeaderButtons = ({ onRequestClose }: ButtonsProps) => {
  return (
    <div className="absolute top-0 right-0">
      <BasicButton
        params={{
          onClick: onRequestClose,
          variant: "ghost",
          ariaLabel: "Toggle delivery plan",
          style: { padding: "24px 6px", borderRadius: "10px 0 0 10px" },
        }}
      >
        <div className="flex gap-1 items-center justify-center">
          <span className="font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]/90 text-[9px]">
            fold{" "}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform rotate-270 text-[var(--color-muted)]`}
          />
        </div>
      </BasicButton>
    </div>
  );
};

const HeaderTitle = ({ planStats }: { planStats?: PlanStats }) => {
  const plansCount = planStats?.plans.total ?? 0;
  const ordersCount = planStats?.orders.total ?? 0;
  const itemsCount = planStats?.items.total ?? 0;
  return (
    <div className="flex gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-[var(--color-muted)]/80">
            Plans
          </span>
          <InfoHover content={PLAN_MAIN_HEADER_INFO} />
        </div>
        <div className="text-xs flex text-[var(--color-muted)] font-normal flex gap-1">
          <span>
            {" "}
            {plansCount} {pluralLabel("plan", plansCount)} •{" "}
          </span>
          <span>
            {" "}
            {ordersCount} {pluralLabel("order", ordersCount)} •{" "}
          </span>
          <span>
            {" "}
            {itemsCount} {pluralLabel("item", itemsCount)}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};
