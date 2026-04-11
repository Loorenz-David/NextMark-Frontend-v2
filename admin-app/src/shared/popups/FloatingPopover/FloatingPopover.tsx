import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  type Placement,
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useDismiss,
  useInteractions,
  size,
} from "@floating-ui/react";

type PropsConfrimPopup = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  classes?: string;
  floatingClassName?: string;
  children: ReactNode;
  reference: ReactNode;
  referenceCLassName?: string;
  offSetNum?: number;
  crossOffSetNum?: number;
  matchReferenceWidth?: boolean;
  removeFlip?: boolean;
  closeOnInsideClick?: boolean;
  outsidePressEvent?: "pointerdown" | "mousedown" | "click";
  renderInPortal?: boolean;
  strategy?: "absolute" | "fixed";
  placement?: Placement;
};

export const FloatingPopover = ({
  open,
  onOpenChange,
  classes,
  floatingClassName,
  referenceCLassName,
  children,
  reference,
  offSetNum,
  crossOffSetNum,
  matchReferenceWidth,
  removeFlip,
  closeOnInsideClick,
  outsidePressEvent,
  renderInPortal,
  strategy,
  placement,
}: PropsConfrimPopup) => {
  const { refs, floatingStyles, context } = useFloating({
    open: open,
    onOpenChange: onOpenChange,
    placement: placement ?? "bottom-start",
    strategy: strategy ?? (renderInPortal ? "fixed" : "absolute"),
    middleware: [
      offset({
        mainAxis: typeof offSetNum == "number" ? offSetNum : 8,
        crossAxis: typeof crossOffSetNum == "number" ? crossOffSetNum : 0,
      }),
      !removeFlip && flip(),
      shift({ padding: 8 }),

      matchReferenceWidth &&
        size({
          apply({ rects, elements }) {
            elements.floating.style.width = `${rects.reference.width}px`;
          },
        }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const dismiss = useDismiss(context, {
    outsidePressEvent: outsidePressEvent ?? "mousedown",
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const floatingNode = (
    <AnimatePresence initial={false}>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={`${renderInPortal ? "z-[130]" : "z-50"} ${floatingClassName ?? ""}`.trim()}
          onClick={(e) => {
            if (!closeOnInsideClick) return;

            const target = e.target as HTMLElement;
            if (target.closest("[data-popover-close]")) {
              onOpenChange(false);
            } else {
              console.error(
                "closeOnInsideClick is set to true on component FloatingPopover, but missing to add [data-popover-close] on the children.",
              );
            }
          }}
        >
          {children}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`${classes} flex-1`}>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`${referenceCLassName ?? ""} h-full w-full`.trim()}
      >
        {reference}
      </div>
      {renderInPortal && typeof document !== "undefined"
        ? createPortal(floatingNode, document.body)
        : floatingNode}
    </div>
  );
};
