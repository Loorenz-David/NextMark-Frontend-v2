import { useState, type ReactNode } from "react";

import { useMobile } from "@/app/viewport";
import { BottomSheet } from "@/shared/overlays/bottomSheet";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import { PanelMenuAttentionDot } from "./PanelMenuRow";

type PanelMenuProps = {
  ariaLabel: string;
  /** Puts a dot on the trigger: something in the menu needs attention. */
  attention?: boolean;
  /** Menu body; `close` dismisses the menu (call it before running an action). */
  children: (close: () => void) => ReactNode;
};

// The order DnD sensors activate on mousedown / touchstart, which React
// dispatches independently of pointerdown — guard all three.
const stopDragActivation = {
  onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  onMouseDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  onTouchStart: (event: { stopPropagation: () => void }) => event.stopPropagation(),
};

/**
 * A panel header's three-dot menu: a round 44px trigger that opens a popover
 * on fine pointers and a bottom sheet for fingers. Unlike `ThreeDotMenu` the
 * body is free-form, so it can carry tabs and summaries above its rows.
 */
export const PanelMenu = ({ ariaLabel, attention = false, children }: PanelMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isCoarsePointer } = useMobile();
  const close = () => setIsOpen(false);

  const body = (
    <div className="flex flex-col" {...stopDragActivation}>
      {children(close)}
    </div>
  );

  const trigger = (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={(event) => {
        event.stopPropagation();
        setIsOpen((current) => !current);
      }}
      {...stopDragActivation}
      className="touch-hit-area relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-button-compact)] transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
        <span className="h-1 w-1 rounded-full bg-[var(--color-text)]" />
      </span>
      {attention ? (
        <span className="absolute right-0 top-0 flex rounded-full border-2 border-[var(--color-page)]">
          <PanelMenuAttentionDot />
        </span>
      ) : null}
    </button>
  );

  if (isCoarsePointer) {
    return (
      <>
        {trigger}
        <BottomSheet open={isOpen} onClose={close} bodyClassName="pb-2">
          {body}
        </BottomSheet>
      </>
    );
  }

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      reference={trigger}
      placement="bottom-end"
      offSetNum={8}
      renderInPortal
      strategy="fixed"
      floatingClassName="z-[220]"
    >
      <div className="admin-glass-popover w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-[var(--color-border-accent)] shadow-xl">
        {body}
      </div>
    </FloatingPopover>
  );
};
