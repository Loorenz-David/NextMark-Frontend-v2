import type { ReactNode } from "react";

export const PANEL_MENU_ROW_CLASS_NAME =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors hover:bg-surface-hover active:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50";

type PanelMenuRowProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Marks the row as the one that needs attention. */
  attention?: boolean;
};

export const PanelMenuAttentionDot = () => (
  <span
    aria-hidden="true"
    className="block h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: "rgb(var(--optimize-r))" }}
  />
);

/** An icon + label action row inside a `PanelMenu`. */
export const PanelMenuRow = ({
  icon,
  label,
  onClick,
  disabled,
  attention,
}: PanelMenuRowProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`${PANEL_MENU_ROW_CLASS_NAME} ${
      attention ? "font-semibold text-[var(--optimize-ink)]" : "text-[var(--color-text)]"
    }`}
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {attention ? <PanelMenuAttentionDot /> : null}
  </button>
);
