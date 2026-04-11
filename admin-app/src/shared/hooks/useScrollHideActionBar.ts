import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";

import { useMediaQuery } from "@/lib/utils/useMediaQuery";

type UseScrollHideActionBarParams = {
  enabled?: boolean;
  expandedHeight: number;
};

const DESKTOP_QUERY = "(min-width: 1000px)";
const NEAR_TOP_THRESHOLD = 28;
const HIDE_SCROLL_TOP_THRESHOLD = 10;
const HIDE_SCROLL_DELTA_THRESHOLD = 1;
const SHOW_SCROLL_DELTA_THRESHOLD = 8;
const MIN_SCROLL_DELTA = 3;
const BOTTOM_BOUNCE_SUPPRESSION_THRESHOLD = 64;
const TOGGLE_COOLDOWN_MS = 220;

export const useScrollHideActionBar = ({
  enabled = true,
  expandedHeight,
}: UseScrollHideActionBarParams) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isActive = enabled && isDesktop;
  const [isActionBarVisible, setIsActionBarVisible] = useState(true);
  const lastScrollTopRef = useRef(0);
  const lastToggleAtRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setIsActionBarVisible(true);
      lastScrollTopRef.current = 0;
      lastToggleAtRef.current = 0;
    }
  }, [isActive]);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!isActive) return;

      const currentScrollTop = event.currentTarget.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;
      const delta = currentScrollTop - lastScrollTop;
      const maxScrollTop = Math.max(
        0,
        event.currentTarget.scrollHeight - event.currentTarget.clientHeight,
      );
      const distanceToBottom = maxScrollTop - currentScrollTop;
      const now = Date.now();
      const isInToggleCooldown =
        now - lastToggleAtRef.current < TOGGLE_COOLDOWN_MS;

      lastScrollTopRef.current = currentScrollTop;

      if (currentScrollTop <= NEAR_TOP_THRESHOLD) {
        if (!isActionBarVisible) {
          setIsActionBarVisible(true);
        }
        return;
      }

      if (Math.abs(delta) < MIN_SCROLL_DELTA) {
        return;
      }

      if (isInToggleCooldown) {
        return;
      }

      if (
        delta > HIDE_SCROLL_DELTA_THRESHOLD &&
        currentScrollTop > HIDE_SCROLL_TOP_THRESHOLD &&
        isActionBarVisible
      ) {
        setIsActionBarVisible(false);
        lastToggleAtRef.current = now;
        return;
      }

      if (
        delta < -SHOW_SCROLL_DELTA_THRESHOLD &&
        !isActionBarVisible &&
        (distanceToBottom > BOTTOM_BOUNCE_SUPPRESSION_THRESHOLD ||
          delta < -SHOW_SCROLL_DELTA_THRESHOLD * 2)
      ) {
        setIsActionBarVisible(true);
        lastToggleAtRef.current = now;
      }
    },
    [isActionBarVisible, isActive],
  );

  return {
    isActionBarVisible: isActive ? isActionBarVisible : true,
    actionBarReservedHeight: isActive ? expandedHeight : 0,
    isDesktopActionBarBehaviorEnabled: isActive,
    handleScroll,
  };
};
