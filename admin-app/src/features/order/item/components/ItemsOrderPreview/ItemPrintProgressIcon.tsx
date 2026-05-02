import { PrintIcon } from "@/assets/icons";

type ItemPrintProgressIconProps = {
  isLoading: boolean;
  progress: number;
};

const circleRadius = 9;
const circleLength = 2 * Math.PI * circleRadius;

export const ItemPrintProgressIcon = ({
  isLoading,
  progress,
}: ItemPrintProgressIconProps) => {
  const clampedProgress = Math.max(0.02, Math.min(1, progress));

  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <PrintIcon className={isLoading ? "h-4 w-4 opacity-0" : "h-4 w-4"} />
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 -rotate-90" viewBox="0 0 24 24" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r={circleRadius}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r={circleRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circleLength}
              strokeDashoffset={circleLength * (1 - clampedProgress)}
              style={{ transition: "stroke-dashoffset 180ms linear" }}
            />
          </svg>
        </span>
      ) : null}
    </span>
  );
};
