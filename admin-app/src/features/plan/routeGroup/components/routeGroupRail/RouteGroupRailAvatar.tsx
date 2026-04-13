import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { PlusIcon } from "@/assets/icons";
import { StateCard } from "@/shared/layout/StateCard";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { RouteGroupRailItem } from "./types";
import { RouteGroupRailPopoverContent } from "./RouteGroupRailPopoverContent";

const DEFAULT_STATE_COLOR = "#6B7280";
const HOVER_OPEN_DELAY_MS = 200;

const withAlpha = (hexColor: string, alphaHex: string) => {
  if (!hexColor.startsWith("#")) return hexColor;
  const normalized =
    hexColor.length === 4
      ? `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`
      : hexColor;
  return `${normalized}${alphaHex}`;
};

type RouteGroupRailAvatarProps = {
  item: RouteGroupRailItem;
  onClick: (item: RouteGroupRailItem) => void;
  isDropTarget?: boolean;
  pulseSequence?: number;
};

export const RouteGroupRailAvatar = ({
  item,
  onClick,
  isDropTarget = false,
  pulseSequence = 0,
}: RouteGroupRailAvatarProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isIncomingPulseActive, setIsIncomingPulseActive] = useState(false);
  const hoverOpenTimeoutRef = useRef<number | null>(null);
  const suppressHoverUntilLeaveRef = useRef(false);
  const mountSequenceRef = useRef<number>(-1);
  const completionRatio = Math.round(item.completionRatio);
  const stateColor = item.stateColor ?? DEFAULT_STATE_COLOR;
  const stateBorderColor = withAlpha(stateColor, item.isActive ? "CC" : "66");
  const fillHeight = `${completionRatio}%`;

  const clearHoverOpenTimeout = useCallback(() => {
    if (hoverOpenTimeoutRef.current != null) {
      window.clearTimeout(hoverOpenTimeoutRef.current);
      hoverOpenTimeoutRef.current = null;
    }
  }, []);

  const schedulePopoverOpen = useCallback(() => {
    if (suppressHoverUntilLeaveRef.current) {
      return;
    }
    clearHoverOpenTimeout();
    hoverOpenTimeoutRef.current = window.setTimeout(() => {
      setIsPopoverOpen(true);
      hoverOpenTimeoutRef.current = null;
    }, HOVER_OPEN_DELAY_MS);
  }, [clearHoverOpenTimeout]);

  const handlePointerLeave = useCallback(() => {
    clearHoverOpenTimeout();
    suppressHoverUntilLeaveRef.current = false;
    setIsPopoverOpen(false);
  }, [clearHoverOpenTimeout]);

  useEffect(() => {
    return () => {
      clearHoverOpenTimeout();
    };
  }, [clearHoverOpenTimeout]);

  useEffect(() => {
    if (!isDropTarget) {
      return;
    }

    suppressHoverUntilLeaveRef.current = true;
    clearHoverOpenTimeout();
    setIsPopoverOpen(false);
  }, [clearHoverOpenTimeout, isDropTarget]);

  useEffect(() => {
    if (mountSequenceRef.current === -1) {
      mountSequenceRef.current = pulseSequence;
      return;
    }

    if (pulseSequence <= mountSequenceRef.current) {
      return;
    }

    setIsIncomingPulseActive(true);
    const timer = window.setTimeout(() => {
      setIsIncomingPulseActive(false);
    }, 1150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pulseSequence]);

  const avatarButton = (
    <button
      type="button"
      className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-light-blue-r),0.55)] ${
        item.isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
      }`}
      onClick={() => onClick(item)}
      onMouseEnter={schedulePopoverOpen}
      onMouseLeave={handlePointerLeave}
      onFocus={() => setIsPopoverOpen(true)}
      onBlur={handlePointerLeave}
    >
      <span className="relative flex h-12 w-12 items-center justify-center">
        <AnimatePresence>
          {isIncomingPulseActive ? (
            <motion.span
              key={`route-group-pulse-${item.route_group_id}`}
              initial={{ scale: 0.72, opacity: 0.45 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-full border border-[rgb(var(--color-light-blue-r))]/60 bg-[rgb(var(--color-light-blue-r))]/12"
            />
          ) : null}
        </AnimatePresence>
        <motion.span
          aria-hidden="true"
          animate={
            isDropTarget
              ? {
                  scale: 1.12,
                  boxShadow: "0px 0px 0px 6px rgba(0,197,49,0.20)",
                }
              : isIncomingPulseActive
                ? {
                    scale: [1, 1.08, 0.98, 1.04, 1],
                    rotate: [0, -8, 6, -4, 0],
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px rgba(29,74,102,0.14)",
                  }
              : {
                  scale: 1,
                  rotate: 0,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px rgba(29,74,102,0.14)",
                }
          }
          transition={{
            type: "tween",
            duration: isIncomingPulseActive ? 0.7 : 0.3,
            ease: isIncomingPulseActive ? "easeInOut" : "easeOut",
          }}
          className={`flex h-12 w-12 items-center justify-center rounded-full border p-[3px] ${
            isDropTarget ? "border-[#00c531]" : ""
          }`}
          style={
            isDropTarget
              ? {
                  backgroundColor: "#00c5311A",
                }
              : {
                  backgroundColor: withAlpha(stateColor, "18"),
                  borderColor: stateBorderColor,
                }
          }
        >
          <span className="relative block h-full w-full overflow-hidden rounded-full bg-[rgba(11,21,24,0.40)]">
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0"
              initial={false}
              animate={{ height: fillHeight }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                background: `linear-gradient(180deg, ${withAlpha(stateColor, "FF")} 0%, ${withAlpha(stateColor, "E6")} 100%)`,
              }}
            />
          </span>
        </motion.span>
        <span
          className="pointer-events-none absolute flex h-[42px] w-[42px] items-center justify-center rounded-full text-[11px] font-semibold text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(19,30,34,0.68) 0%, rgba(12,21,24,0.52) 58%, rgba(7,14,16,0.42) 100%)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDropTarget ? (
              <motion.span
                key="plus"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1.08, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4" style={{ color: "#00c531" }} />
              </motion.span>
            ) : isIncomingPulseActive ? (
              <motion.span
                key="incoming-pulse-progress"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: [1, 1.22, 1], opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                {completionRatio}%
              </motion.span>
            ) : (
              <motion.span
                key="progress"
                initial={false}
              >
                {completionRatio}%
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
      <span
        className={`line-clamp-2 text-xs font-medium leading-4 ${
          item.isActive
            ? "text-[var(--color-text)]"
            : "text-[var(--color-text)]/80"
        }`}
      >
        {item.label}
      </span>
      {item.stateLabel ? (
        <StateCard
          label={item.stateLabel}
          color={item.stateColor}
          style={{ transform: "scale(0.92)" }}
        />
      ) : null}
    </button>
  );

  return (
    <FloatingPopover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      reference={avatarButton}
      placement="right"
      offSetNum={10}
      renderInPortal={true}
      classes="w-full !flex-none"
      floatingClassName="z-[220]"
    >
      <div
        onMouseEnter={() => {
          clearHoverOpenTimeout();
          setIsPopoverOpen(true);
        }}
        onMouseLeave={handlePointerLeave}
      >
        <RouteGroupRailPopoverContent item={item} />
      </div>
    </FloatingPopover>
  );
};
