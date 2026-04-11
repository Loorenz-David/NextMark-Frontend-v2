import { useMemo } from "react";

import { CheckMarkIcon } from "@/assets/icons";
import { CustomTimePicker } from "@/shared/inputs/CustomTimePicker";
import { Switch } from "@/shared/inputs/Switch";

export type OperatingHoursEditorDayOption<
  TKey extends string | number = string | number,
> = {
  key: TKey;
  label: string;
};

export type OperatingHoursEditorEntry<
  TKey extends string | number = string | number,
> = {
  key: TKey;
  enabled: boolean;
  isClosed?: boolean;
  openTime?: string | null;
  closeTime?: string | null;
};

type OperatingHoursEditorProps<TKey extends string | number = string | number> =
  {
    days: Array<OperatingHoursEditorDayOption<TKey>>;
    entries: Array<OperatingHoursEditorEntry<TKey>>;
    onToggleDay: (key: TKey) => void;
    onOpenTimeChange: (key: TKey, value: string | null) => void;
    onCloseTimeChange: (key: TKey, value: string | null) => void;
    onClosedChange?: (key: TKey, value: boolean) => void;
    allowClosedToggle?: boolean;
  };

export const OperatingHoursEditor = <TKey extends string | number>({
  days,
  entries,
  onToggleDay,
  onOpenTimeChange,
  onCloseTimeChange,
  onClosedChange,
  allowClosedToggle = true,
}: OperatingHoursEditorProps<TKey>) => {
  const entriesByKey = useMemo(() => {
    const byKey = new Map<TKey, OperatingHoursEditorEntry<TKey>>();
    entries.forEach((entry) => {
      byKey.set(entry.key, entry);
    });
    return byKey;
  }, [entries]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-page)] shadow-sm">
      {days.map((day, index) => {
        const entry = entriesByKey.get(day.key);
        const isSelected = Boolean(entry?.enabled);
        const isClosed = Boolean(entry?.isClosed);

        return (
          <div
            key={String(day.key)}
            role="button"
            tabIndex={0}
            onClick={() => onToggleDay(day.key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggleDay(day.key);
              }
            }}
            className={`grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[140px_1fr_auto] ${
              index > 0 ? "border-t border-[var(--color-border)]" : ""
            } ${isSelected ? "bg-[var(--color-light-blue)]/10" : "bg-transparent"}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
                {isSelected ? (
                  <CheckMarkIcon className="h-4 w-4 text-blue-600" />
                ) : null}
              </span>
              <span className="text-sm font-medium text-[var(--color-text)]">
                {day.label}
              </span>
            </div>

            <div className="flex min-h-[38px] items-center">
              {isSelected && (!allowClosedToggle || !isClosed) ? (
                <div
                  className="flex items-center gap-3"
                  onClick={(event) => event.stopPropagation()}
                >
                  <CustomTimePicker
                    selectedTime={entry?.openTime ?? null}
                    onChange={(value) => onOpenTimeChange(day.key, value)}
                  />
                  <span className="text-xs text-[var(--color-muted)]">-</span>
                  <CustomTimePicker
                    selectedTime={entry?.closeTime ?? null}
                    onChange={(value) => onCloseTimeChange(day.key, value)}
                  />
                </div>
              ) : null}

              {isSelected && allowClosedToggle && isClosed ? (
                <span className="text-xs italic text-[var(--color-muted)]">
                  Marked as closed
                </span>
              ) : null}
            </div>

            <div className="flex justify-end">
              {isSelected && allowClosedToggle && onClosedChange ? (
                <div
                  className="flex items-center gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="text-xs text-[var(--color-muted)]">
                    Closed
                  </span>
                  <Switch
                    value={isClosed}
                    onChange={(value) => onClosedChange(day.key, value)}
                    sizeClassName="h-7 w-12"
                    ariaLabel={`Toggle ${day.label} closed`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
