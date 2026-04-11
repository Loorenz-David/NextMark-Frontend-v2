import { BoldArrowIcon, SearchIcon } from "@/assets/icons";

import type { ObjectLinkSelectorInputProps } from "./ObjectLinkSelector.types";

export const ObjectLinkSelectorInput = ({
  mode,
  open,
  disabled,
  placeholder,
  displayValue,
  selectedCount,
  selectedButtonLabel,
  containerClassName,
  onInputChange,
  onInputFocus,
  onToggleOptions,
  onOpenSelectedOverlay,
}: ObjectLinkSelectorInputProps) => (
  <div
    className={`
      flex gap-2 items-center
      ${containerClassName ?? "custom-field-container rounded-xl"} ${
        disabled ? "opacity-60" : ""
      }`}
  >
    {mode === "multi" ? (
      <div className="flex items-center gap-2 text-[var(--color-muted)]">
        <SearchIcon className="h-4 w-4" />
      </div>
    ) : null}

    <input
      value={displayValue}
      onChange={(event) => onInputChange(event.target.value)}
      onFocus={onInputFocus}
      placeholder={placeholder}
      disabled={disabled}
      className="form-plain-input w-full"
    />

    {mode === "multi" && selectedCount > 0 ? (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenSelectedOverlay();
        }}
        className="shrink-0 rounded-full border border-[rgba(var(--color-light-blue-r),0.32)] bg-[rgba(var(--color-light-blue-r),0.14)] px-3 py-1 text-xs text-[var(--color-muted)] cursor-pointer hover:text-[var(--color-text)]"
      >
        {selectedButtonLabel} ({selectedCount})
      </button>
    ) : null}

    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleOptions();
      }}
      disabled={disabled}
      className="flex items-center content-center "
      aria-label="Toggle options"
    >
      <BoldArrowIcon
        className={`h-3 w-3 ${open ? "rotate-270" : "rotate-90"}`}
      />
    </button>
  </div>
);
