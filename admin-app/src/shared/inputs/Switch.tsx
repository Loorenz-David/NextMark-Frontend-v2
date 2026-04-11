import { cn } from "@/lib/utils/cn";

export type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  sizeClassName?: string;
  className?: string;
  ariaLabel?: string;
};

export const Switch = ({
  value,
  onChange,
  disabled = false,
  sizeClassName = "h-9 w-15",
  className,
  ariaLabel,
}: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        onChange(!value);
      }}
      className={cn(
        "relative inline-flex items-center rounded-full border border-[var(--color-muted)]/50 px-1 transition-colors",
        sizeClassName,
        value
          ? "justify-end bg-[rgba(var(--color-light-blue-r),0.30)]"
          : "justify-start bg-[var(--color-page)]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow transition-transform border border-[var(--color-muted)]/18",
        )}
      />
    </button>
  );
};
