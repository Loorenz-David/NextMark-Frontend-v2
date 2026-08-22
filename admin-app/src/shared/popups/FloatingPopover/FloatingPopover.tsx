import { useEffect, type ReactNode, type RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  type Placement,
  type Boundary,
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
  /**
   * Placements to try, in order, when the preferred one overflows. Lets a
   * caller flip alignment (e.g. `bottom-start` → `bottom-end`) and not only
   * the side, which is all the default flip does.
   */
  fallbackPlacements?: Placement[];
  /**
   * Element whose edges count as overflow for flip/shift, instead of the
   * viewport. Read lazily from the ref on every position update so the
   * caller can pass it before the element has mounted.
   */
  boundaryRef?: RefObject<Element | null>;
  /**
   * Position the floating element with top/left instead of a CSS transform.
   * Needed when the popover hosts dnd-kit droppables: dnd-kit measures
   * droppable rects transform-agnostically, so a transform-positioned
   * popover's drop targets would register at the viewport origin.
   */
  positionWithoutTransform?: boolean;
  /**
   * Called once the floating element has been placed, and again on every
   * reposition. The popover mounts at the viewport origin and is moved
   * asynchronously; anything that measured its contents before then (dnd-kit
   * droppables do) needs this signal to measure again.
   */
  onPositioned?: () => void;
};

/**
 * The corner of the floating element that touches its reference, so a child
 * scaling in grows out of the reference rather than from its own centre.
 */
const resolveTransformOrigin = (placement: Placement): string => {
  const [side, alignment] = placement.split("-") as [
    "top" | "bottom" | "left" | "right",
    "start" | "end" | undefined,
  ];

  if (side === "left" || side === "right") {
    const vertical =
      alignment === "start" ? "top" : alignment === "end" ? "bottom" : "center";
    return `${side === "left" ? "right" : "left"} ${vertical}`;
  }

  const horizontal =
    alignment === "start" ? "left" : alignment === "end" ? "right" : "center";
  return `${side === "top" ? "bottom" : "top"} ${horizontal}`;
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
  fallbackPlacements,
  boundaryRef,
  positionWithoutTransform,
  onPositioned,
}: PropsConfrimPopup) => {
  const isElementNode = (value: unknown): value is Element => value instanceof Element

  // Derivable options: resolved on each compute so a boundary mounted after
  // the first render is still honoured.
  const resolveBoundary = (): Boundary =>
    boundaryRef?.current ?? "clippingAncestors";

  const { refs, floatingStyles, context, isPositioned, x, y } = useFloating({
    open: open,
    onOpenChange: onOpenChange,
    placement: placement ?? "bottom-start",
    strategy: strategy ?? (renderInPortal ? "fixed" : "absolute"),
    transform: !positionWithoutTransform,
    middleware: [
      offset({
        mainAxis: typeof offSetNum == "number" ? offSetNum : 8,
        crossAxis: typeof crossOffSetNum == "number" ? crossOffSetNum : 0,
      }),
      !removeFlip &&
        flip(() => ({
          boundary: resolveBoundary(),
          ...(fallbackPlacements ? { fallbackPlacements } : {}),
        })),
      shift(() => ({ padding: 8, boundary: resolveBoundary() })),

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
    outsidePress: (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return true;
      }

      const isInsideCurrentPopover =
        (isElementNode(refs.reference.current) && refs.reference.current.contains(target)) ||
        (isElementNode(refs.floating.current) && refs.floating.current.contains(target));

      if (isInsideCurrentPopover) {
        return false;
      }

      // Nested floating popovers should not dismiss each other during interaction.
      if (target.closest("[data-floating-popover-root]")) {
        return false;
      }

      return true;
    },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  // Runs after the commit that applied the new coordinates, so listeners
  // measure the placed element rather than its pre-positioned origin.
  useEffect(() => {
    if (!open || !isPositioned) return;
    onPositioned?.();
  }, [open, isPositioned, x, y, onPositioned]);

  const floatingNode = (
    <AnimatePresence initial={false}>
      {open && (
        <div
          ref={refs.setFloating}
          // Exposed as a CSS variable so children can anchor their own
          // enter/exit transforms to the reference without knowing the
          // resolved placement (flip can change it at runtime).
          style={{
            ...floatingStyles,
            ["--floating-transform-origin" as string]:
              resolveTransformOrigin(context.placement),
          }}
          {...getFloatingProps()}
          data-floating-popover-root
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
        data-floating-popover-root
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
