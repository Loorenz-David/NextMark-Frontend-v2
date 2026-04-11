import { useRef, type KeyboardEvent } from "react";

import { TimeIcon } from "@/assets/icons";

type TimeInputFieldProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  onOpen: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (input: HTMLInputElement | null) => void;
  onClick: (
    input: HTMLInputElement | null,
    caret: number | null | undefined,
  ) => void;
};

export const TimeInputField = ({
  value,
  disabled,
  className = "w-[85px] rounded-full border border-[var(--color-border-accent)] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  onOpen,
  onKeyDown,
  onFocus,
  onClick,
}: TimeInputFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={`flex items-center gap-2  rounded-xl text-xm ${className ?? ""}`}
      onClick={() => {
        if (disabled) {
          return;
        }
        const input = inputRef.current;
        input?.focus();
        onOpen();
        onClick(input, input?.selectionStart);
      }}
    >
      <TimeIcon className="app-icon  h-4 w-4 text-[var(--color-muted)]/70" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        readOnly
        disabled={disabled}
        aria-label="Time"
        className="w-full bg-transparent  text-sm outline-none"
        onFocus={(event) => {
          onOpen();
          onFocus(event.currentTarget);
        }}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
