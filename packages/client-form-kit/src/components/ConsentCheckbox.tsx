import type { ReactNode } from "react";
import { CheckMarkIcon } from "../icons/CheckMarkIcon";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Rendered beside the box; may hold its own interactive trigger. */
  label: ReactNode;
  id: string;
  invalid?: boolean;
};

/**
 * The box and the label are separate targets on purpose: the terms label holds
 * its own button that opens the document, and a wrapping `<label>` would steal
 * that tap on touch devices.
 */
export const ConsentCheckbox = ({
  checked,
  onChange,
  label,
  id,
  invalid = false,
}: Props) => (
  <div className="flex items-start gap-3">
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border transition-colors",
        checked
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
          : invalid
            ? "border-[var(--danger)] bg-[var(--danger)]/8"
            : "border-[var(--rule-strong)] bg-[var(--paper-sunken)] hover:border-[var(--ink-faint)]",
      ].join(" ")}
    >
      {checked ? <CheckMarkIcon className="h-3.5 w-3.5" /> : null}
    </button>

    <div className="pt-0.5 text-sm leading-6 text-[var(--ink-soft)]">{label}</div>
  </div>
);
