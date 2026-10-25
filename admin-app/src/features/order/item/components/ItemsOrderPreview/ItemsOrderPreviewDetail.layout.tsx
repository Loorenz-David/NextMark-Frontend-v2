import { PlusIcon, PrintIcon } from "@/assets/icons";
import {
  ThreeDotMenu,
  type ThreeDotMenuOption,
} from "@/shared/buttons/ThreeDotMenu";

import { ItemCard } from "../ItemCard";
import { ItemPrintProgressIcon } from "./ItemPrintProgressIcon";
import type { ItemsOrderPreviewLayoutProps } from "./ItemsOrderPreview.types";

const ROUND_BUTTON_CLASS_NAME =
  "h-11 w-11 shrink-0 rounded-full border border-border bg-surface-raised shadow-[var(--shadow-button-compact)]";

/**
 * Order detail items card: a header strip (summary and a menu for add and
 * print) above the item cards and a dashed add button, which is all an
 * empty order shows. Grows with its items; the page owns the scroll.
 */
export const ItemsOrderPreviewDetailLayout = ({
  header,
  resolvedLoading,
  resolvedItems,
  showPrintAction,
  disablePrintAction,
  isPrintActionLoading,
  printProgress,
  onPrintLabels,
  controlled,
  expandedItemClientId,
  onToggleExpand,
  onEditItem,
  onDeleteItem,
  orderId,
  onOpenEditItem,
  onAddItem,
  totalItems,
  totalWeight,
  totalVolume,
  testNodes,
}: ItemsOrderPreviewLayoutProps) => {
  const menuOptions: ThreeDotMenuOption[] = [
    {
      label: "Add item",
      action: onAddItem,
      icon: <PlusIcon className="h-4 w-4 stroke-[var(--color-muted)]" />,
    },
  ];
  if (showPrintAction) {
    menuOptions.push({
      label: "Print labels",
      action: onPrintLabels,
      icon: <PrintIcon className="h-4 w-4 text-[var(--color-muted)]" />,
      disabled: disablePrintAction,
    });
  }

  const defaultHeader = (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-subtle px-4 py-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          Items
        </h3>
        <p className="mt-0.5 truncate text-sm text-[var(--color-muted)]">
          {totalItems} {totalItems === 1 ? "item" : "items"} ·{" "}
          {totalWeight.toFixed(2)} kg · {totalVolume.toFixed(2)} m³
        </p>
      </div>

      {isPrintActionLoading ? (
        <span
          role="status"
          aria-label="Printing item labels"
          className={`${ROUND_BUTTON_CLASS_NAME} flex items-center justify-center text-[var(--color-text)]`}
        >
          <ItemPrintProgressIcon isLoading progress={printProgress} />
        </span>
      ) : (
        <ThreeDotMenu
          dotWidth={4}
          dotHeight={4}
          dotClassName="bg-[var(--color-text)]"
          triggerClassName={`${ROUND_BUTTON_CLASS_NAME} touch-hit-area cursor-pointer transition-colors hover:bg-surface-hover`}
          options={menuOptions}
        />
      )}
    </div>
  );

  return (
    <section className="admin-glass-panel flex w-full flex-col overflow-hidden rounded-3xl border-border shadow-md!">
      {header ?? defaultHeader}

      <div className="flex flex-col gap-3 p-4">
        {resolvedLoading ? (
          <div className="px-1 text-sm text-[var(--color-muted)]">
            Loading items...
          </div>
        ) : resolvedItems.length ? (
          resolvedItems.map((item) => (
            <ItemCard
              key={item.client_id}
              item={item}
              showDelete={!controlled || Boolean(onDeleteItem)}
              isExpanded={expandedItemClientId === item.client_id}
              onToggleExpand={() => onToggleExpand(item.client_id)}
              onDelete={onDeleteItem ? () => onDeleteItem(item) : undefined}
              onEdit={
                onEditItem
                  ? () => onEditItem(item)
                  : () => {
                      if (typeof orderId !== "number") return;
                      onOpenEditItem(orderId, item.client_id);
                    }
              }
            />
          ))
        ) : null}

        {testNodes.map((node) => node)}

        <button
          type="button"
          onClick={onAddItem}
          className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-px-15 font-medium text-[var(--color-text)] transition-colors hover:bg-surface-hover active:bg-surface-hover"
        >
          <PlusIcon className="h-4 w-4 stroke-[var(--color-text)]" />
          Add item
        </button>
      </div>
    </section>
  );
};
