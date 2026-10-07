import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import { BasicButton } from "@/shared/buttons/BasicButton";
import SegmentedSelect from "@/shared/inputs/SegmentedSelect";
import { Switch } from "@/shared/inputs/Switch";
import { CustomDatePicker } from "@/shared/inputs/CustomDatePicker";
import { verifyHexColor } from "@/shared/layout/StateCard";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupFooter,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";
import { PLAN_TYPES } from "@/features/plan/domain/planType";
import { planIconTypeMap } from "@/features/plan/utils/planIconTypeMap";

import { useOrderStates } from "../../store/orderStateHooks.store";
import {
  DEFAULT_ORDER_FILTER_DRAFT,
  NO_PLAN_TYPE,
  ORDER_PLAN_TYPE_FILTER_LABELS,
  countActiveOrderFilters,
  isSameOrderFilterDraft,
  summarizeOrderFilterDraft,
  type OrderFilterDraft,
  type OrderPlanTypeFilter,
  type OrderScheduleMode,
} from "../../domain/orderFilterPanel.domain";
import { OrderFilterDrawer } from "./OrderFilterDrawer";

export type OrderFilterPopupPayload = {
  draft: OrderFilterDraft;
  onApply: (draft: OrderFilterDraft) => void;
};

const PLAN_TYPE_FILTER_OPTIONS: OrderPlanTypeFilter[] = [...PLAN_TYPES, NO_PLAN_TYPE];

const SCHEDULE_OPTIONS: Array<{ label: string; value: OrderScheduleMode }> = [
  { label: "All", value: "all" },
  { label: "Unscheduled", value: "unscheduled" },
  { label: "Scheduled", value: "scheduled" },
];

// Muted idle text (readable on light) with the blue selection pill.
const SEGMENTED_STYLE = {
  containerBg: "rgba(var(--theme-surface-slate-r),0.06)",
  containerBorder: "var(--color-border)",
  selectedBg:
    "linear-gradient(180deg, rgba(var(--info-r),0.22), rgba(var(--info-r),0.16))",
  selectedBorder: "rgba(var(--info-r),0.42)",
  selectedTextColor: "var(--info-ink)",
  textColor: "var(--color-muted)",
  textSize: "12px",
  buttonPadding: "7px 10px",
};

const CheckMarkIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12.5 9.5 17 19 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    />
  </svg>
);

const SelectionMark = ({ selected }: { selected: boolean }) =>
  selected ? (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-light-blue-r))] text-[var(--color-text-inverse)]">
      <CheckMarkIcon className="h-3 w-3" />
    </span>
  ) : (
    <span className="flex h-4 w-4 shrink-0 rounded-full border border-[var(--color-border-accent)]" />
  );

/** One selectable row: no card chrome, a hover wash, bolder text when selected. */
const OptionRow = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
      selected ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text)]"
    }`}
  >
    <SelectionMark selected={selected} />
    {children}
  </button>
);

const TextAction = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer text-xs font-medium text-[rgb(var(--color-light-blue-r))] hover:underline"
  >
    {label}
  </button>
);

const parseDateValue = (value: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toggleInList = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];

export const OrderFilterPopup = ({
  payload,
  onClose,
}: StackComponentProps<OrderFilterPopupPayload>) => {
  const initialDraft = payload?.draft ?? DEFAULT_ORDER_FILTER_DRAFT;
  const [draft, setDraft] = useState<OrderFilterDraft>(initialDraft);
  const hasUnsavedChanges = !isSameOrderFilterDraft(draft, initialDraft);

  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges,
    onClose,
  });

  const orderStates = useOrderStates();
  const sortedStates = useMemo(
    () =>
      [...orderStates].sort(
        (left, right) =>
          (left.index ?? Number.MAX_SAFE_INTEGER) -
          (right.index ?? Number.MAX_SAFE_INTEGER),
      ),
    [orderStates],
  );

  if (!payload) {
    throw new Error("OrderFilterPopup payload is missing.");
  }

  const summary = summarizeOrderFilterDraft(draft);
  const activeCount = countActiveOrderFilters(draft);
  const isScheduled = draft.schedule === "scheduled";

  const patch = (partial: Partial<OrderFilterDraft>) =>
    setDraft((current) => ({ ...current, ...partial }));

  const handleApply = async () => {
    payload.onApply(draft);
    await closeController.confirmClose();
  };

  return (
    <>
      <FeaturePopupShell
        onRequestClose={closeController.requestClose}
        size="mdNoHeight"
        variant="center"
      >
        <FeaturePopupHeader
          title="Filter orders"
          subtitle={
            activeCount === 0
              ? "No filters applied"
              : `${activeCount} ${activeCount === 1 ? "filter" : "filters"} active`
          }
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="bg-[var(--color-page)]">
          <div className="flex max-h-[min(70vh,640px)] flex-col overflow-y-auto scroll-thin px-5 pb-20">
            <OrderFilterDrawer
              label="Schedule"
              summary={summary.schedule}
              isDefault={draft.schedule === "unscheduled"}
              defaultOpen
            >
              <div className="flex flex-col gap-4">
                <SegmentedSelect
                  options={SCHEDULE_OPTIONS}
                  selectedValue={draft.schedule}
                  onSelect={(value) => {
                    const next = value as OrderScheduleMode;
                    patch(
                      next === "scheduled"
                        ? { schedule: next }
                        : { schedule: next, scheduleFrom: null, scheduleTo: null },
                    );
                  }}
                  styleConfig={SEGMENTED_STYLE}
                />
                {/* Always mounted so switching modes never shifts the segmented control. */}
                <div
                  className={`flex flex-col gap-2 transition-opacity ${
                    isScheduled ? "opacity-100" : "pointer-events-none opacity-40"
                  }`}
                  aria-disabled={!isScheduled}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-muted)]">
                      Plan start date range, either side optional
                    </span>
                    {isScheduled && (draft.scheduleFrom || draft.scheduleTo) ? (
                      <TextAction
                        label="Clear dates"
                        onClick={() => patch({ scheduleFrom: null, scheduleTo: null })}
                      />
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--color-muted)]">From</span>
                      <CustomDatePicker
                        selectionMode="single"
                        renderPopoverInPortal
                        disabled={!isScheduled}
                        date={parseDateValue(draft.scheduleFrom)}
                        onChange={(value) => patch({ scheduleFrom: value || null })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--color-muted)]">To</span>
                      <CustomDatePicker
                        selectionMode="single"
                        renderPopoverInPortal
                        disabled={!isScheduled}
                        date={parseDateValue(draft.scheduleTo)}
                        onChange={(value) => patch({ scheduleTo: value || null })}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </OrderFilterDrawer>

            <OrderFilterDrawer
              label="Order state"
              summary={summary.orderStates}
              isDefault={draft.orderStates.length === 0}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-end gap-4 pb-1 pr-2">
                  <TextAction
                    label="Select all"
                    onClick={() =>
                      patch({ orderStates: sortedStates.map((state) => state.name) })
                    }
                  />
                  <TextAction label="Clear" onClick={() => patch({ orderStates: [] })} />
                </div>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  {sortedStates.map((state) => {
                    const color = verifyHexColor(state.color);
                    return (
                      <OptionRow
                        key={state.client_id}
                        selected={draft.orderStates.includes(state.name)}
                        onClick={() =>
                          patch({ orderStates: toggleInList(draft.orderStates, state.name) })
                        }
                      >
                        {color ? (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ) : null}
                        <span className="truncate">{state.name}</span>
                      </OptionRow>
                    );
                  })}
                </div>
              </div>
            </OrderFilterDrawer>

            <OrderFilterDrawer
              label="Plan type"
              summary={summary.planTypes}
              isDefault={draft.planTypes.length === 0}
            >
              <div className="flex flex-col gap-1">
                {draft.planTypes.length > 0 ? (
                  <div className="flex items-center justify-end pb-1 pr-2">
                    <TextAction label="Clear" onClick={() => patch({ planTypes: [] })} />
                  </div>
                ) : null}
                {PLAN_TYPE_FILTER_OPTIONS.map((type) => {
                  const Icon = type === NO_PLAN_TYPE ? null : planIconTypeMap[type];
                  return (
                    <OptionRow
                      key={type}
                      selected={draft.planTypes.includes(type)}
                      onClick={() => patch({ planTypes: toggleInList(draft.planTypes, type) })}
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4 shrink-0 app-icon" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 text-center text-xs leading-4 text-[var(--color-muted)]">
                          –
                        </span>
                      )}
                      <span className={type === NO_PLAN_TYPE ? "text-[var(--color-muted)]" : undefined}>
                        {ORDER_PLAN_TYPE_FILTER_LABELS[type]}
                      </span>
                    </OptionRow>
                  );
                })}
              </div>
            </OrderFilterDrawer>

            <OrderFilterDrawer
              label="Archive"
              summary={summary.archive}
              isDefault={!draft.archivedOnly}
            >
              <div className="flex items-center justify-between gap-4 px-2">
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--color-text)]">
                    Show archived orders only
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">
                    Archived orders are hidden unless this is on.
                  </span>
                </div>
                <Switch
                  value={draft.archivedOnly}
                  onChange={(value) => patch({ archivedOnly: value })}
                  ariaLabel="Show archived orders only"
                />
              </div>
            </OrderFilterDrawer>
          </div>
        </FeaturePopupBody>

        <FeaturePopupFooter>
          <BasicButton
            params={{
              variant: "ghost",
              onClick: () => setDraft({ ...DEFAULT_ORDER_FILTER_DRAFT }),
              ariaLabel: "Reset filters to default",
            }}
          >
            Reset to default
          </BasicButton>
          <BasicButton
            params={{
              variant: "primary",
              onClick: () => {
                void handleApply();
              },
              ariaLabel: "Apply order filters",
            }}
          >
            Apply
          </BasicButton>
        </FeaturePopupFooter>
      </FeaturePopupShell>

      <FeaturePopupClosePrompt controller={closeController} />
    </>
  );
};
