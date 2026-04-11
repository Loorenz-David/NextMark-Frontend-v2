import type { ReactNode } from 'react'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { DeliveryWindowDisplayRow } from '../../../../flows/orderFormDeliveryWindows.flow'

type DeliveryWindowCalendarDayPopoverProps = {
  open: boolean
  onOpenChange: (next: boolean) => void
  reference: ReactNode
  localDate: string
  rows: DeliveryWindowDisplayRow[]
  kind: 'windows' | 'closed-warning'
  onMouseEnterContent: () => void
  onMouseLeaveContent: () => void
  onRemoveWindow: (row: DeliveryWindowDisplayRow) => void
  onEditWindow: (row: DeliveryWindowDisplayRow) => void
  onAddWindow: (localDate: string) => void
  disableAdd: boolean
}

export const DeliveryWindowCalendarDayPopover = ({
  open,
  onOpenChange,
  reference,
  localDate,
  rows,
  kind,
  onMouseEnterContent,
  onMouseLeaveContent,
  onRemoveWindow,
  onEditWindow,
  onAddWindow,
  disableAdd,
}: DeliveryWindowCalendarDayPopoverProps) => {
  return (
    <FloatingPopover
      open={open}
      onOpenChange={onOpenChange}
      reference={reference}
      offSetNum={6}
      classes="h-full"
      outsidePressEvent="click"
    >
      <div
        className="admin-glass-popover w-64 rounded-xl border border-[var(--color-border-accent)] p-2 shadow-lg"
        onMouseEnter={onMouseEnterContent}
        onMouseLeave={onMouseLeaveContent}
      >
        {kind === 'closed-warning' ? (
          <div className="p-2 text-xs text-[var(--color-text)]">
            <div className="mb-1 font-semibold">Date unavailable</div>
            <p className="text-[11px] text-[var(--color-muted)]">
              This date is closed by costumer operating hours.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 px-2 text-xs font-semibold text-[var(--color-text)]">{localDate}</div>
            <div className="mb-2 max-h-44 overflow-y-auto scroll-thin px-1">
              {rows.length ? (
                <div className="flex flex-col gap-1 max-h-[200px]">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between border-b border-b-white/[0.08] px-2 py-2 last:border-b-0 "
                    >
                      <span className="text-[11px] text-[var(--color-text)]">
                        {row.start} - {row.end}
                      </span>
                      <div className="flex items-center gap-2">
                        <BasicButton
                          params={{
                            variant: 'text',
                            onClick: () => onEditWindow(row),
                            style:{padding:'5px 8px'},
                            className:
                              'text-[10px] border-none',
                          }}
                        >
                          Edit
                        </BasicButton>
                        <BasicButton
                          params={{
                            variant: 'text',
                            onClick: () => onRemoveWindow(row),
                            style:{padding:'5px 8px'},
                            className:
                              'text-[10px] border-none font-normal normal-case tracking-normal text-red-400 hover:bg-red-500/12 ',
                          }}
                        >
                          Remove
                        </BasicButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-1 py-2 text-[11px] text-[var(--color-muted)]">No windows for this day.</div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[var(--color-border-accent)] px-2 py-2">
              <button
                type="button"
                disabled={disableAdd}
                onClick={() => onAddWindow(localDate)}
                className="w-full rounded-md border-1 border-[var(--color-border-accent)] border-dashed px-2 py-1 text-[10px] text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-white/[0.08]"
              >
                Add time window
              </button>
            </div>
          </>
        )}
      </div>
    </FloatingPopover>
  )
}
