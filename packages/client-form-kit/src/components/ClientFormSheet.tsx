import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { BackArrowIcon } from "../icons/BackArrowIcon";

/**
 * `AnimatePresence` only runs exit animations on a motion component, so the
 * overlay itself is wrapped — a plain `FloatingOverlay` here would unmount
 * instantly and skip the fade out.
 */
const MotionFloatingOverlay = motion.create(FloatingOverlay);

/**
 * `sheet` — bottom sheet on phones, centered dialog from `sm` up.
 * `fullscreen` — edge to edge on phones with no border or corner radius, since
 * nothing shows behind it; it becomes the same centered dialog from `sm` up.
 */
type ClientFormSheetVariant = "sheet" | "fullscreen";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  /**
   * `pinned` keeps the action visible at all times. `inline` places it at the end
   * of the scrolling content instead, so the reader has to reach the bottom
   * before they can act — which is the point of the rules gate.
   */
  footerPlacement?: "pinned" | "inline";
  /**
   * `pinned` keeps the title bar fixed above the scrolling body. `inline` makes
   * it the first thing in the scroll, so it travels up with the content.
   */
  headerPlacement?: "pinned" | "inline";
  /** Renders a back arrow at the head of the header; omit for no back action. */
  onBack?: () => void;
  backLabel?: string;
  /** Rules must be acknowledged, so that gate opts out of backdrop/Escape dismissal. */
  dismissible?: boolean;
  variant?: ClientFormSheetVariant;
  children: ReactNode;
};

const DESKTOP_PANEL =
  "sm:h-auto sm:max-h-[80dvh] sm:max-w-lg sm:rounded-[var(--radius-lg)] sm:shadow-[0_10px_30px_rgba(46,42,36,0.18)]";

const PANEL_BY_VARIANT: Record<ClientFormSheetVariant, string> = {
  sheet: `max-h-[88dvh] w-full max-w-lg rounded-t-[var(--radius-lg)] border border-[var(--rule-strong)] shadow-[0_-10px_30px_rgba(46,42,36,0.18)] ${DESKTOP_PANEL} sm:border sm:border-[var(--rule-strong)]`,
  // Borderless at every breakpoint — the backdrop already separates it from the page.
  fullscreen: `h-full w-full border-0 shadow-none ${DESKTOP_PANEL}`,
};

const CONTAINER_BY_VARIANT: Record<ClientFormSheetVariant, string> = {
  sheet: "items-end justify-center",
  fullscreen: "items-stretch justify-stretch sm:items-center sm:justify-center",
};

/**
 * Long content scrolls inside the panel rather than the page, and `dvh` keeps it
 * clear of mobile browser chrome. Scroll locking and focus trapping come from
 * floating-ui.
 */
export const ClientFormSheet = ({
  open,
  onOpenChange,
  title,
  description,
  footer,
  footerPlacement = "pinned",
  headerPlacement = "pinned",
  onBack,
  backLabel = "Go back",
  dismissible = true,
  variant = "sheet",
  children,
}: Props) => {
  const isFullscreen = variant === "fullscreen";
  const hasPinnedFooter = Boolean(footer) && footerPlacement === "pinned";
  const hasInlineFooter = Boolean(footer) && footerPlacement === "inline";
  const isHeaderInline = headerPlacement === "inline";
  const { refs, context } = useFloating({
    open,
    onOpenChange,
  });

  const dismiss = useDismiss(context, {
    enabled: dismissible,
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const headerNode = (
    <header
      className={`border-b border-[var(--rule)] px-5 pb-4 sm:px-6 sm:pt-5 ${
        isHeaderInline ? "" : "shrink-0"
      } ${
        // Full screen means the header sits under the status bar / notch.
        isFullscreen ? "pt-[max(1.25rem,env(safe-area-inset-top))]" : "pt-5"
      }`}
    >
      {/* A grab bar would promise a drag-to-dismiss the full-page view does not have. */}
      {isFullscreen ? null : (
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--rule-strong)] sm:hidden"
        />
      )}
      {/* With a description the arrow lines up with the title row;
          with a title alone it centres against it. */}
      <div className={`flex gap-3 ${description ? "items-start" : "items-center"}`}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className={`-ml-1.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)] ${
              description ? "mt-0.5" : ""
            }`}
          >
            <BackArrowIcon className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0">
          <h2 className="text-xl font-normal tracking-[0.01em] text-[var(--ink)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-[var(--ink-soft)]">{description}</p>
          ) : null}
        </div>
      </div>
    </header>
  );

  return (
    <FloatingPortal>
      <AnimatePresence>
        {open ? (
          <MotionFloatingOverlay
            lockScroll
            className="client-form-portal z-[200] bg-[rgba(46,42,36,0.45)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className={`fixed inset-0 flex sm:items-center sm:p-6 ${CONTAINER_BY_VARIANT[variant]}`}
            >
              <FloatingFocusManager context={context} modal returnFocus>
                <motion.div
                  ref={refs.setFloating}
                  {...getFloatingProps()}
                  initial={{ y: 32, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className={`flex flex-col overflow-hidden bg-[var(--paper-raised)] ${PANEL_BY_VARIANT[variant]}`}
                >
                  {isHeaderInline ? null : headerNode}

                  {/* Padding lives on the blocks, not the scroll port, so an
                      inline header can sit flush at the top of the scroll. */}
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {isHeaderInline ? headerNode : null}

                    <div
                      className={`px-5 pt-5 sm:px-6 ${
                        hasInlineFooter
                          ? "pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5"
                          : "pb-5"
                      }`}
                    >
                      {children}

                      {hasInlineFooter ? (
                        <div className="mt-6 border-t border-[var(--rule)] pt-5">{footer}</div>
                      ) : null}
                    </div>
                  </div>

                  {hasPinnedFooter ? (
                    <footer className="shrink-0 border-t border-[var(--rule)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-5">
                      {footer}
                    </footer>
                  ) : null}
                </motion.div>
              </FloatingFocusManager>
            </div>
          </MotionFloatingOverlay>
        ) : null}
      </AnimatePresence>
    </FloatingPortal>
  );
};
