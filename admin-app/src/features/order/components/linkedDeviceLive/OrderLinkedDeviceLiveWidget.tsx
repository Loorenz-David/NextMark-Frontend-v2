import { AnimatePresence, motion } from "framer-motion";

import {
  SUBMITTED_WIDGET_DISMISS_MS,
  useOrderLinkedDeviceLiveWidgetController,
} from "../../controllers/useOrderLinkedDeviceLiveWidget.controller";

/**
 * Floating status card for a linked-device fill in progress. Fixed to the
 * bottom-left above the app shell (below the order form's z-[100] overlays it
 * never needs to outrank, above the workspace) — same fixed-positioning
 * pattern as the shared toast stack, no portal.
 */
export const OrderLinkedDeviceLiveWidget = () => {
  const {
    widgetState,
    stepLabel,
    stepNumber,
    stepCount,
    orderLabel,
    sessionKey,
    handleOpen,
    handleClose,
  } = useOrderLinkedDeviceLiveWidgetController();

  return (
    <AnimatePresence>
      {widgetState !== "hidden" ? (
        <motion.div
          key={`linked-device-live-${sessionKey}`}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-90"
        >
          <button
            type="button"
            onClick={handleOpen}
            className="relative block w-88 overflow-hidden rounded-2xl border border-primary/30 bg-page px-5 py-4 text-left shadow-2xl"
          >
            {widgetState === "submitted" ? (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                fill="none"
              >
                <motion.rect
                  key={`countdown-${sessionKey}`}
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="15"
                  className="stroke-primary"
                  strokeWidth="2"
                  initial={{ pathLength: 1 }}
                  animate={{ pathLength: 0 }}
                  transition={{
                    duration: SUBMITTED_WIDGET_DISMISS_MS / 1000,
                    ease: "linear",
                  }}
                />
              </svg>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {widgetState === "submitted" ? (
                  <>
                    <p className="flex items-baseline gap-2.5 text-base font-semibold text-text">
                      Order submitted
                      {orderLabel ? (
                        <span className="text-sm font-normal text-faint">
                          {orderLabel}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-sm text-faint">
                      Customer form applied to the order.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-baseline gap-2.5 text-base font-semibold text-text">
                      <span className="relative flex h-2.5 w-2.5 self-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                      Filling form
                      {orderLabel ? (
                        <span className="text-sm font-normal text-faint">
                          {orderLabel}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1.5 truncate text-sm text-faint">
                      {widgetState === "requested" ? (
                        "Waiting for customer…"
                      ) : (
                        <>
                          <span className="font-medium text-muted">
                            Step {stepNumber} of {stepCount}
                          </span>
                          {" · "}
                          {stepLabel}
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              <span
                role="button"
                tabIndex={0}
                aria-label="Dismiss"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClose();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.stopPropagation();
                    handleClose();
                  }
                }}
                className="-mr-1 -mt-1 rounded-md p-1 text-faint transition-colors hover:text-text"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </span>
            </div>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
