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
      className="flex min-h-[7.5rem] w-full cursor-pointer flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5 text-left transition hover:border-[rgb(var(--color-light-blue-r),0.24)] hover:bg-white/[0.05]"
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
              ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-300/45 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100"
              : "rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
          }
        >
          {isEnabled ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-200"
              aria-hidden="true"
            />
          ) : null}
          {status}
        </span>
      </div>
    </div>
  );
};
