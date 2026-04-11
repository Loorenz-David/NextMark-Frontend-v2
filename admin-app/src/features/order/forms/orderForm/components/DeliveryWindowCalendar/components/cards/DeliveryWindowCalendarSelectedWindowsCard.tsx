import { BasicButton } from '@/shared/buttons/BasicButton'
import { TimeIcon } from '@/assets/icons'

import type { DeliveryWindowDisplayRow } from '../../../../flows/orderFormDeliveryWindows.flow'
import { formatLocalDateCardLabel, formatNoSelectedWindowsHelper } from '../../DeliveryWindowCalendarLayout.flow'
import type { SelectedDateWindowGroup } from '../../DeliveryWindowCalendar.readModel.flow'
import type { DeliveryWindowCalendarDensity } from '../../DeliveryWindowCalendarDensity.flow'

type DeliveryWindowCalendarSelectedWindowsCardProps = {
  groups: SelectedDateWindowGroup[]
  hasSelection: boolean
  helperText?: string | null
  onEdit: (row: DeliveryWindowDisplayRow) => void
  onRemove: (row: DeliveryWindowDisplayRow) => void
  density?: DeliveryWindowCalendarDensity
}

export const DeliveryWindowCalendarSelectedWindowsCard = ({
  groups,
  hasSelection,
  helperText,
  onEdit,
  onRemove,
  density = 'regular',
}: DeliveryWindowCalendarSelectedWindowsCardProps) => {
  const isCompact = density === 'compact'

  return (
    <section className={`${isCompact ? 'rounded-xl p-2.5' : 'rounded-2xl p-3 md:p-4'} border border-[var(--color-border-accent)] bg-[var(--color-page)]`}>
      <h3 className={`${isCompact ? 'text-sm' : 'text-base md:text-lg'} font-semibold text-[var(--color-text)]`}>Time Windows</h3>
      <p className={`${isCompact ? 'text-xs' : 'text-sm md:text-base'} mt-1 text-[var(--color-muted)]`}>Existing time windows for selected dates</p>

      {!hasSelection ? (
        <div className={`${isCompact ? 'mt-4 text-xs' : 'mt-5 text-sm md:mt-7 md:text-base'} text-center text-[var(--color-muted)]`}>
          {helperText ?? formatNoSelectedWindowsHelper()}
        </div>
      ) : (
        <div className={`${isCompact ? 'mt-2 gap-2.5' : 'mt-3 gap-3'} flex flex-col`}>
          {groups.map((group) => (
            <div key={group.localDate} className="flex flex-col gap-2">
              <div className={`${isCompact ? 'text-xs' : 'text-sm md:text-base'} font-semibold text-[var(--color-text)]`}>
                {formatLocalDateCardLabel(group.localDate)}
              </div>

              {group.windows.length ? (
                group.windows.map((row) => (
                  <div
                    key={row.key}
                    className={`${isCompact ? 'rounded-lg px-2 py-1.5' : 'rounded-xl px-3 py-2'} flex items-center justify-between bg-[var(--color-primary)]/10`}
                  >
                    <div className={`${isCompact ? 'gap-1 text-xs' : 'gap-1.5 text-sm md:gap-2 md:text-base'} flex items-center font-medium text-[var(--color-dark-blue)]`}>
                      <TimeIcon className={`${isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[var(--color-primary)]`} />
                      <span>
                        {row.start} - {row.end}
                      </span>
                    </div>

                    <div className={`${isCompact ? 'gap-2' : 'gap-3'} flex items-center`}>
                      <BasicButton
                        params={{
                          variant: 'text',
                          onClick: () => onEdit(row),
                          className:
                            `${isCompact ? 'text-[10px]' : 'text-[11px] md:text-xs'} h-auto border-none bg-transparent px-0 py-0 font-semibold normal-case tracking-normal text-[var(--color-dark-blue)]`,
                        }}
                      >
                        Edit
                      </BasicButton>
                      <BasicButton
                        params={{
                          variant: 'text',
                          onClick: () => onRemove(row),
                          className:
                            `${isCompact ? 'text-[10px]' : 'text-[11px] md:text-xs'} h-auto border-none bg-transparent px-0 py-0 font-semibold normal-case tracking-normal text-red-500 hover:bg-transparent`,
                        }}
                      >
                        Remove
                      </BasicButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${isCompact ? 'rounded-lg px-2 py-1.5 text-[11px]' : 'rounded-xl px-3 py-2 text-xs md:text-sm'} border border-dashed border-[var(--color-border-accent)] text-[var(--color-muted)]`}>
                  No time windows for this date.
                </div>
              )}
            </div>
          ))}

          {helperText ? <p className={`${isCompact ? 'text-[11px]' : 'text-xs md:text-sm'} text-[var(--color-muted)]`}>{helperText}</p> : null}
        </div>
      )}
    </section>
  )
}
