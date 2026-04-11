import { useCallback } from "react";
import type { ChangeEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { BasicButton } from "../buttons";
import { PlusIcon } from "@/assets/icons";

type CustomCounterProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

const clampValue = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) {
    return min;
  }
  if (max !== undefined && value > max) {
    return max;
  }
  return value;
};

export const CustomCounter = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "custom-field-container rounded-xl",
}: CustomCounterProps) => {
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      if (raw.trim() === "") {
        return;
      }
      const next = Number(raw);
      if (Number.isNaN(next)) {
        return;
      }
      onChange(clampValue(next, min, max));
    },
    [max, min, onChange],
  );

  const handleStep = useCallback(
    (delta: number) => {
      onChange(clampValue(value + delta, min, max));
    },
    [max, min, onChange, value],
  );

  const canDecrement = min === undefined || value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className={cn("flex", className)}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none"
        value={value}
        onChange={handleInputChange}
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
            <span className=" text-[var(--color-muted)] ">-</span>
          </div>
        </BasicButton>
      </div>
    </div>
  );
};
