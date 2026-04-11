import { useEffect, useMemo, useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";

import { TimeColumn } from "./components/TimeColumn";
import { TimePickerPopover } from "./components/TimePickerPopover";

type CustomNumberPickerProps = {
  selectedValue: number | null | undefined;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  popoverWidth?: number;
  popoverHeight?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const sanitizeRange = (min: number, max: number) => {
  const safeMin = Number.isFinite(min) ? Math.trunc(min) : 0;
  const safeMax = Number.isFinite(max) ? Math.trunc(max) : safeMin;
  return safeMin <= safeMax
    ? { min: safeMin, max: safeMax }
    : { min: safeMax, max: safeMin };
};

export const CustomNumberPicker = ({
  selectedValue,
  onChange,
  min,
  max,
  label,
  disabled = false,
  className,
  containerClassName = "w-full h-10  rounded-xl border border-[var(--color-border)] bg-[var(--color-page)]  text-sm text-[var(--color-text)]",
  popoverWidth = 220,
  popoverHeight = 260,
}: CustomNumberPickerProps) => {
  const range = useMemo(() => sanitizeRange(min, max), [min, max]);
  const safeSelected = useMemo(
    () => clamp(Number(selectedValue ?? range.min), range.min, range.max),
    [selectedValue, range.max, range.min],
  );
  const values = useMemo(
    () =>
      Array.from(
        { length: range.max - range.min + 1 },
        (_, index) => range.min + index,
      ),
    [range.max, range.min],
  );

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(safeSelected);

  useEffect(() => {
    if (!open) {
      setDraft(safeSelected);
    }
  }, [open, safeSelected]);

  const openPicker = () => {
    if (disabled) return;
    setDraft(safeSelected);
    setOpen(true);
  };

  const closeWithCancel = (nextOpen: boolean) => {
    if (disabled) return;
    if (nextOpen) {
      openPicker();
      return;
    }
    setDraft(safeSelected);
    setOpen(false);
  };

  const handleDone = () => {
    onChange(clamp(draft, range.min, range.max));
    setOpen(false);
  };

  const inputReference = (
    <div
      className={`flex cursor-pointer items-center px-3   ${
        disabled ? "opacity-60" : ""
      } ${containerClassName ?? className ?? ""}`}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (disabled) return;
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-expanded={open}
    >
      {safeSelected}
    </div>
  );

  return (
    <TimePickerPopover
      open={open}
      onOpenChange={closeWithCancel}
      reference={inputReference}
      width={popoverWidth}
      height={popoverHeight}
    >
      <div className="flex flex-col gap-3 p-3">
        <div className="grid grid-cols-1 gap-2">
          <TimeColumn
            label={label}
            values={values}
            value={draft}
            onChange={setDraft}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-2 border-t border-white/[0.08] p-3"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <BasicButton
          params={{
            variant: "ghost",
            onClick: () => {
              setDraft(safeSelected);
              setOpen(false);
            },
            className: "px-3 py-1 text-xs text-[var(--color-muted)]",
            ariaLabel: "Cancel number selection",
          }}
        >
          Cancel
        </BasicButton>
        <BasicButton
          params={{
            variant: "secondary",
            onClick: handleDone,
            className: "px-3 py-1 text-xs",
            ariaLabel: "Confirm number selection",
          }}
        >
          Done
        </BasicButton>
      </div>
    </TimePickerPopover>
  );
};
