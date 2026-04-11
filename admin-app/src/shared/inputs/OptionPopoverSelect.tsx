import { useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

import { BoldArrowIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

export type PopoverSelectOption<TValue = unknown> = {
  icon?: ReactNode;
  label: string;
  value: TValue;
};

export type OptionPopoverSelectProps<TValue = unknown> = {
  options: Array<PopoverSelectOption<TValue>>;
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  placeholder?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  inputFieldClassName?: string;
  optionClassName?: string;
  offset?: number;
  matchReferenceWidth?: boolean;
  isOptionEqual?: (left: TValue, right: TValue) => boolean;
  getOptionKey?: (option: PopoverSelectOption<TValue>, index: number) => string;
};

const defaultIsOptionEqual = <TValue,>(left: TValue, right: TValue) =>
  Object.is(left, right);

export const OptionPopoverSelect = <TValue,>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyLabel = "None",
  allowEmpty = true,
  disabled = false,
  className,
  dropdownClassName,
  optionClassName,
  inputFieldClassName,
  offset = 8,
  matchReferenceWidth = true,
  isOptionEqual = defaultIsOptionEqual,
  getOptionKey,
}: OptionPopoverSelectProps<TValue>) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (nextValue: TValue | null) => {
    if (disabled) {
      return;
    }
    onChange(nextValue);
    setOpen(false);
  };

  const stopInteraction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const selectedOption = useMemo(() => {
    if (value === null) return null;
    return options.find((option) => isOptionEqual(option.value, value)) ?? null;
  }, [isOptionEqual, options, value]);

  const resolveOptionKey = (
    option: PopoverSelectOption<TValue>,
    index: number,
  ) =>
    getOptionKey ? getOptionKey(option, index) : `${option.label}-${index}`;
  return (
    <FloatingPopover
      open={open}
      onOpenChange={setOpen}
      classes={`relative w-full ${className ?? ""}`.trim()}
      offSetNum={offset}
      matchReferenceWidth={matchReferenceWidth}
      closeOnInsideClick={true}
      reference={
        <button
          type="button"
          className={
            inputFieldClassName
              ? inputFieldClassName
              : "custom-field-container flex w-full items-center justify-between gap-2 rounded-xl text-left disabled:cursor-not-allowed disabled:opacity-60"
          }
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          disabled={disabled}
          aria-label="Toggle options"
        >
          <span
            className={
              selectedOption
                ? "text-[var(--color-text)] text-sm"
                : "text-[var(--color-muted)] text-sm"
            }
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <BoldArrowIcon
            className={`h-3 w-3 ${open ? "rotate-270" : "rotate-90"}`}
          />
        </button>
      }
    >
      <div
        className={`admin-glass-popover rounded-2xl border border-[var(--color-border-accent)] p-2 shadow-xl ${dropdownClassName ?? ""}`.trim()}
      >
        {allowEmpty ? (
          <button
            type="button"
            onMouseDown={stopInteraction}
            onClick={(event) => {
              stopInteraction(event);
              handleSelect(null);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              value === null
                ? "border border-[rgb(var(--color-light-blue-r),0.28)] bg-[rgb(var(--color-light-blue-r),0.12)] text-[rgb(var(--color-light-blue-r))]"
                : "text-[var(--color-text)] hover:bg-white/[0.08]"
            } ${optionClassName ?? ""}`.trim()}
            data-popover-close="true"
          >
            <span className="truncate">{emptyLabel}</span>
          </button>
        ) : null}

        {options.map((option, index) => {
          const selected = value !== null && isOptionEqual(option.value, value);
          return (
            <button
              key={resolveOptionKey(option, index)}
              type="button"
              onMouseDown={stopInteraction}
              onClick={(event) => {
                stopInteraction(event);
                handleSelect(option.value);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selected
                  ? "border border-[rgb(var(--color-light-blue-r),0.28)] bg-[rgb(var(--color-light-blue-r),0.12)] text-[rgb(var(--color-light-blue-r))]"
                  : "text-[var(--color-text)] hover:bg-white/[0.08]"
              } ${optionClassName ?? ""}`.trim()}
              data-popover-close="true"
            >
              {option.icon ? (
                <span className="shrink-0">{option.icon}</span>
              ) : null}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </FloatingPopover>
  );
};
