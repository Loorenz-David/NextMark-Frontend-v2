import type { ReactNode } from 'react'

import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

type TimePickerPopoverProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  reference: ReactNode
  children: ReactNode
  width: number
  height: number
  renderInPortal?: boolean
}

export const TimePickerPopover = ({
  open,
  onOpenChange,
  reference,
  children,
  width,
  height,
  renderInPortal = true,
}: TimePickerPopoverProps) => {
  return (
    <FloatingPopover
      open={open}
      onOpenChange={onOpenChange}
      reference={reference}
      classes="w-full"
      offSetNum={6}
      crossOffSetNum={0}
      renderInPortal={renderInPortal}
      floatingClassName={renderInPortal ? 'z-[220]' : 'z-[220]'}
    >
      <div
        className="admin-glass-popover rounded-xl border border-[var(--color-border-accent)] shadow-2xl"
        style={{
          width,
          minHeight: height,
        }}
      >
        {children}
      </div>
    </FloatingPopover>
  )
}
