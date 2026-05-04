import { ItemIcon } from "@/assets/icons";
import type { AssignedRouteStopRowDisplay } from "../domain/assignedRouteDisplay.types";

type AssignedRouteStopRowProps = {
  stop: AssignedRouteStopRowDisplay;
  onOpenStopDetail: (stopClientId: string) => void;
  isFocused?: boolean;
};

function DurationChip({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-1 rounded-md border border-white/45 px-2 py-1 text-xs text-white/85">
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 6V12L16 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM9 2H15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
      <span>{label}</span>
    </span>
  );
}

export function AssignedRouteStopRow({
  stop,
  onOpenStopDetail,
  isFocused = false,
}: AssignedRouteStopRowProps) {
  const focusedClassName = isFocused
    ? "ring-1 ring-inset ring-sky-300/50 bg-sky-300/5 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.12)]"
    : "";

  return (
    <button
      className={`grid w-full grid-cols-[4rem_minmax(0,1fr)_5.5rem] gap-2 text-left transition active:scale-[0.995] ${
        stop.isActive ? "bg-black/20" : ""
      } ${focusedClassName} ${stop.isCompleted ? "opacity-85" : ""}`}
      onClick={() => onOpenStopDetail(stop.stopClientId)}
      type="button"
    >
      <div className="grid min-h-full grid-rows-[0.75rem_auto_1fr] justify-items-center text-white">
        <span
          aria-hidden="true"
          className="w-[3px] -mb-px self-stretch"
          style={{ backgroundColor: "var(--timeline-accent)" }}
        />
        <div className="flex flex-col items-center justify-start pt-2 pb-2">
          {stop.stopIndexLabel ? (
            <span className="text-sm font-semibold leading-none">
              {stop.stopIndexLabel}
            </span>
          ) : null}
          {stop.timeLabel ? (
            <span className="mt-1 text-xs font-semibold leading-none">
              {stop.timeLabel}
            </span>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="w-[3px] -mt-px self-stretch"
          style={{ backgroundColor: "var(--timeline-accent)" }}
        />
      </div>

      <div className="min-w-0 py-4 pr-2">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-white">
          {stop.title}
        </p>

        {stop.addressLine ? (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/70">
            {stop.addressLine}
          </p>
        ) : null}

        {stop.durationLabel ? (
          <div className="mt-3">
            <DurationChip label={stop.durationLabel} />
          </div>
        ) : null}

        {stop.itemCountLabel ? (
          <div className="mt-5 flex items-center gap-2 text-sm leading-snug text-white/80">
            <ItemIcon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-white/72"
            />
            <p className="font-medium text-white/88">{stop.itemCountLabel}</p>
          </div>
        ) : null}

        {stop.phoneLine ? (
          <p className="mt-4 truncate text-sm font-medium text-white/78 underline decoration-white/30 underline-offset-2">
            {stop.phoneLine}
          </p>
        ) : null}

        {stop.orderNotes.map((note, index) => (
          <div
            key={note.id}
            className={`${index === 0 ? "mt-3" : "mt-2"} rounded-[20px] border px-3 py-2 text-sm ${note.containerClassName}`}
          >
            <p
              className={`truncate text-[8px] font-medium uppercase tracking-[0.2em] ${note.labelClassName}`}
            >
              {note.label}
            </p>
            <p
              className={`truncate text-xs leading-5 ${note.contentClassName}`}
            >
              {note.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 justify-end items-start py-4 pr-2 pt-3">
        {stop.badgeLabel ? (
          <span
            className="inline-flex  items-center justify-center rounded-md px-2 py-[2px] text-xs font-semibold text-white"
            style={{ backgroundColor: "rgba(124, 163, 255, 0.70)" }}
          >
            {stop.badgeLabel}
          </span>
        ) : null}
      </div>
    </button>
  );
}
