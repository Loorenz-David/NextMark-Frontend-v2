import type { ReactNode } from 'react'
import {
  CalendarRoot,
  type CalendarModel,
} from '@/shared/calendar'
import type { CostumerOperatingHours } from '@/features/costumer'
import { BackArrowIcon, BoldArrowIcon } from '@/assets/icons'
import type { DeliveryWindowDisplayRow } from '../../../../flows/orderFormDeliveryWindows.flow'
import { formatDateInTimeZone, isDayClosedByOperatingHours } from '../../../../flows/orderFormDeliveryWindows.flow'
import { WEEKDAY_LABELS } from '../../DeliveryWindowCalendarLayout.flow'
import { DeliveryWindowCalendarDayCell } from './DeliveryWindowCalendarDayCell'
import { DeliveryWindowCalendarDayPopover } from './DeliveryWindowCalendarDayPopover'
import type { DeliveryWindowCalendarDayPopoverState } from '../../DeliveryWindowCalendarDayPopover.action'
import { getDeliveryWindowsForLocalDate } from '../../DeliveryWindowCalendarDayWindows.flow'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarCalendarProps = {
  model: CalendarModel
  operatingHours: CostumerOperatingHours[]
  timeZone: string
  windowsByDate: Record<string, DeliveryWindowDisplayRow[]>
  activePopover: DeliveryWindowCalendarDayPopoverState | null
  onOpenWindowsPopover: (dayKey: string) => void
  onOpenClosedWarningPopover: (dayKey: string) => void
  onScheduleClosePopover: () => void
  onKeepPopoverOpen: () => void
  onClosePopoverNow: () => void
  onMarkSelectionInteraction: () => void
  onAddWindowForDate: (localDate: string) => void
  onRemoveWindow: (row: DeliveryWindowDisplayRow) => void
  onEditWindow: (row: DeliveryWindowDisplayRow) => void
  isPopoverBlocked: boolean
  disableAddWindow: boolean
  footer?: ReactNode
}

export const DeliveryWindowCalendarCalendar = ({
  model,
  operatingHours,
  timeZone,
  windowsByDate,
  activePopover,
  onOpenWindowsPopover,
  onOpenClosedWarningPopover,
  onScheduleClosePopover,
  onKeepPopoverOpen,
  onClosePopoverNow,
  onMarkSelectionInteraction,
  onAddWindowForDate,
  onRemoveWindow,
  onEditWindow,
  isPopoverBlocked,
  disableAddWindow,
  footer,
}: DeliveryWindowCalendarCalendarProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { calendar } = shellScale
  const visibleDaysMatrix = model.daysMatrix.filter((weekRow) =>
    weekRow.some((dayEntry) => dayEntry.isCurrentMonth),
  )
  const displayModel = { ...model, daysMatrix: visibleDaysMatrix }

  return (
    <div className={calendar.rootClassName}>
      <CalendarRoot
        model={displayModel}
        renderHeader={(calendarModel) => {
          const monthLabel = calendarModel.visibleMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })

          return (
            <div className={calendar.headerClassName}>
              <div className={calendar.headerRowClassName}>
                <button
                  type="button"
                  onClick={calendarModel.prevMonth}
                  aria-label="Previous month"
                  className={calendar.navButtonClassName}
                >
                  <BoldArrowIcon className={ `rotate-180 ${calendar.navIconClassName}`} />
                </button>

                <div className={calendar.monthTitleClassName}>{monthLabel}</div>

                <button
                  type="button"
                  onClick={calendarModel.nextMonth}
                  aria-label="Next month"
                  className={calendar.navButtonClassName}
                >
                  <BoldArrowIcon className={`${calendar.navIconClassName} `} />
                </button>
              </div>

              <div className={calendar.weekdayRowClassName}>
                {WEEKDAY_LABELS.map((dayLabel) => (
                  <div key={dayLabel} className={calendar.weekdayLabelClassName}>
                    {dayLabel}
                  </div>
                ))}
              </div>
            </div>
          )
        }}
        renderDay={(params) => {
          const localDate = formatDateInTimeZone(params.date, timeZone)
          const dayKey = localDate
          const rows = getDeliveryWindowsForLocalDate({
            windowsByDate,
            localDate,
          })
          const windowCount = rows.length

          const closedByHours = isDayClosedByOperatingHours({
            date: params.date,
            operatingHours,
            timeZone,
          })

          const isPopoverOpen = activePopover?.dayKey === dayKey

          return (
            <DeliveryWindowCalendarDayPopover
              open={isPopoverOpen}
              onOpenChange={(next) => {
                if (!next) {
                  onClosePopoverNow()
                }
              }}
              localDate={localDate}
              rows={rows}
              kind={isPopoverOpen ? activePopover.kind : 'windows'}
              onMouseEnterContent={onKeepPopoverOpen}
              onMouseLeaveContent={onScheduleClosePopover}
              onRemoveWindow={onRemoveWindow}
              onEditWindow={onEditWindow}
              onAddWindow={onAddWindowForDate}
              disableAdd={disableAddWindow || closedByHours}
              reference={
                <DeliveryWindowCalendarDayCell
                  day={params.day}
                  isSelected={params.isSelected}
                  isInRange={params.isInRange && !closedByHours}
                  tabIndex={params.tabIndex}
                  ariaLabel={params.ariaLabel}
                  isToday={params.isToday}
                  isCurrentMonth={params.isCurrentMonth}
                  isClosed={closedByHours}
                  windowCount={windowCount}
                  onSelect={() => {
                    onMarkSelectionInteraction()
                    if (closedByHours) {
                      onOpenClosedWarningPopover(dayKey)
                      return
                    }
                    params.onSelect()
                  }}
                  onMouseEnter={() => {
                    params.onMouseEnter?.()
                    if (closedByHours) {
                      return
                    }
                    if (windowCount > 0 && !isPopoverBlocked) {
                      onOpenWindowsPopover(dayKey)
                    }
                  }}
                  onMouseLeave={() => {
                    params.onMouseLeave?.()
                    onScheduleClosePopover()
                  }}
                />
              }
            />
          )
        }}
      />
      {footer ? <div className={calendar.footerClassName}>{footer}</div> : null}
    </div>
  )
}
