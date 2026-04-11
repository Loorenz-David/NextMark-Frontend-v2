import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";

import type { MessageStatus } from "../MessageHandlerContext";

const STATUS_STYLES: Record<
  MessageStatus,
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    container: string;
  }
> = {
  success: {
    icon: CheckMarkIcon,
    container: "bg-emerald-600/95 ring-emerald-400/60",
  },
  warning: {
    icon: TriangleWarningIcon,
    container: "bg-amber-500/95 ring-amber-300/60",
  },
  error: {
    icon: WarningIcon,
    container: "bg-rose-600/95 ring-rose-400/60",
  },
  info: {
    icon: InfoIcon,
    container: "bg-sky-600/95 ring-sky-400/60",
  },
};

function CheckMarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
    </svg>
  );
}

function TriangleWarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 4 21 19H3L12 4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 9v4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="16.75" fill="currentColor" r="1" />
    </svg>
  );
}

function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5v6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="16.75" fill="currentColor" r="1" />
    </svg>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="8" fill="currentColor" r="1" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M7 7 17 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

interface MessageCardProps {
  status: MessageStatus;
  message: string;
  details?: string;
  createdAt: number;
  durationMs: number;
  onDismiss: () => void;
}

export function MessageCard({
  status,
  message,
  details,
  createdAt,
  durationMs,
  onDismiss,
}: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { icon: Icon, container } = STATUS_STYLES[status];
  const hasDetails = Boolean(details);
  const isTruncated = message.length > 150;
  const canExpand = hasDetails || isTruncated;
  const displayText = useMemo(() => {
    if (isExpanded || message.length <= 150) {
      return message;
    }
    return `${message.slice(0, 150)}…`;
  }, [isExpanded, message]);

  const toggleExpanded = () => {
    if (!canExpand) return;
    setIsExpanded((prev: boolean) => !prev);
  };

  useEffect(() => {
    if (!durationMs) return;
    let animationFrameId = 0;
    const update = () => {
      const elapsed = Date.now() - createdAt;
      const next = Math.min(1, Math.max(0, elapsed / durationMs));
      setProgress(next);
      if (next < 1) {
        animationFrameId = window.requestAnimationFrame(update);
      }
    };
    animationFrameId = window.requestAnimationFrame(update);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [createdAt, durationMs]);

  const ringSize = 26;
  const ringStroke = 2;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);

  return (
    <div className="pointer-events-auto">
      <div
        aria-expanded={canExpand ? isExpanded : undefined}
        className={`relative w-full rounded-2xl px-4 py-3 text-white shadow-2xl ring-1 transition ${container} ${
          canExpand ? "cursor-pointer" : ""
        }`}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (!canExpand) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpanded();
          }
        }}
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
      >
        <div className="flex items-center gap-3 pr-6">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-medium leading-snug">{displayText}</p>
            {hasDetails && isExpanded ? (
              <p className="text-xs leading-relaxed text-white/90">{details}</p>
            ) : null}
          </div>
        </div>
        <button
          aria-label="Dismiss message"
          className="absolute right-3 top-2 rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          type="button"
        >
          <span className="relative flex h-6 w-6 items-center justify-center cursor-pointer">
            <svg
              className="absolute inset-0 h-6 w-6"
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              width={ringSize}
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                fill="none"
                r={ringRadius}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={ringStroke}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                fill="none"
                r={ringRadius}
                stroke="rgba(255, 255, 255, 0.85)"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                strokeWidth={ringStroke}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </svg>
            <CloseIcon className="h-4 w-4 text-white]" />
          </span>
        </button>
      </div>
    </div>
  );
}
