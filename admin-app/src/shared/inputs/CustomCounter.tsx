import { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent, FocusEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { BasicButton } from "../buttons";
import { PlusIcon } from "@/assets/icons";

type CustomCounterProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowFloat?: boolean;
  className?: string;
};

const clampValue = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
};

const parseNumeric = (raw: string, allowFloat: boolean): number | null => {
  if (raw === "" || raw === "-" || raw === ".") return null;
  const n = allowFloat ? parseFloat(raw) : parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
};

export const CustomCounter = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  allowFloat = false,
  className = "custom-field-container rounded-xl",
}: CustomCounterProps) => {
  const [draft, setDraft] = useState<string>(String(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setDraft(String(value));
    }
  }, [value]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const pattern = allowFloat ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
      if (raw !== "" && !pattern.test(raw)) return;
      setDraft(raw);
      const n = parseNumeric(raw, allowFloat);
      if (n !== null) {
        onChange(clampValue(n, min, max));
      }
    },
    [allowFloat, max, min, onChange],
  );

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    if (draft === "0") setDraft("");
  }, [draft]);

  const handleBlur = useCallback(
    (_event: FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      const n = parseNumeric(draft, allowFloat);
      const normalized = n !== null ? clampValue(n, min, max) : (min ?? 0);
      setDraft(String(normalized));
      if (normalized !== value) {
        onChange(normalized);
      }
    },
    [allowFloat, draft, max, min, onChange, value],
  );

  const handleStep = useCallback(
    (delta: number) => {
      const next = clampValue(value + delta, min, max);
      setDraft(String(next));
      onChange(next);
    },
    [max, min, onChange, value],
  );

  const canDecrement = min === undefined || value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className={cn("flex", className)}>
      <input
        type="text"
        inputMode={allowFloat ? "decimal" : "numeric"}
        className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none"
        value={draft}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <div className="flex items-center justify-center gap-2">
        <BasicButton
          params={{
            variant: "rounded",
            onClick: () => handleStep(step),
            style: { height: "25px", width: "25px" },
            disabled: !canIncrement,
          }}
        >
          <PlusIcon className="h-3 w-3 text-[var(--color-muted)]" />
        </BasicButton>

        <BasicButton
          params={{
            variant: "rounded",
            onClick: () => handleStep(-step),
            style: { height: "25px", width: "25px" },
            disabled: !canDecrement,
          }}
        >
          <div className="items-start flex">
            <span className="text-[var(--color-muted)]">-</span>
          </div>
        </BasicButton>
      </div>
    </div>
  );
};
