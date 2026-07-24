import type { MouseEventHandler } from "react";

export type TemplateTriggerCardProps = {
  title: string;
  description?: string;
  status: string;
  onSelect: MouseEventHandler<HTMLDivElement>;
};

export const TemplateTriggerCard = ({
  title,
  description,
  status,
  onSelect,
}: TemplateTriggerCardProps) => {
  const isEnabled = status.trim().toLowerCase() === "enabled";

  return (
    <div
      role="button"
      onClick={onSelect}
      className="flex min-h-[7.5rem] w-full cursor-pointer flex-col gap-3 rounded-3xl border border-border bg-surface-raised p-5 text-left transition hover:border-[rgb(var(--color-light-blue-r),0.24)] hover:bg-surface-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
            {description ?? "No description."}
          </p>
        </div>
        <span
          className={
            isEnabled
              ? "inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-success"
              : "rounded-full border border-border bg-surface-raised px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
          }
        >
          {isEnabled ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-success-soft"
              aria-hidden="true"
            />
          ) : null}
          {status}
        </span>
      </div>
    </div>
  );
};
