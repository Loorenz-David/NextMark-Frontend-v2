import type { ReactNode } from 'react'
import { useEffect } from 'react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'

type MarkerAnchorPopoverProps = {
  open: boolean
  anchorEl: HTMLElement | null
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}

export const MarkerAnchorPopover = ({
  open,
  anchorEl,
  onOpenChange,
  children,
  className,
}: MarkerAnchorPopoverProps) => {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: 'top',
    strategy: 'fixed',
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    if (!anchorEl) return
    refs.setReference(anchorEl)
  }, [anchorEl, refs])

  useEffect(() => {
    if (!open || !anchorEl) return

    let frameId = 0
    const syncAnchorState = () => {
      if (!anchorEl.isConnected) {
        onOpenChange(false)
        return
      }
      frameId = window.requestAnimationFrame(syncAnchorState)
    }

    frameId = window.requestAnimationFrame(syncAnchorState)
    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [anchorEl, onOpenChange, open])

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'pointerdown',
  })
  const { getFloatingProps } = useInteractions([dismiss])

  if (!open || !anchorEl) {
    return null
  }

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className={className}
      >
        {children}
      </div>
    </FloatingPortal>
  )
}

