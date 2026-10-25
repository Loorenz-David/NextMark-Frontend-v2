import type { ReactNode } from "react";

type RoundIconButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

/** The 44px round icon button used in panel headers (close, edit). */
export const RoundIconButton = ({
  ariaLabel,
  onClick,
  disabled,
  children,
}: RoundIconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-button-compact)] transition-colors hover:bg-surface-hover active:bg-surface-hover disabled:opacity-50"
  >
    {children}
  </button>
);
