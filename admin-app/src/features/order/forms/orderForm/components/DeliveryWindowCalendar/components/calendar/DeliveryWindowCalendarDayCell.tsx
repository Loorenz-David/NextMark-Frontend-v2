import { CalendarDayCell } from '@/shared/calendar'
import type { CalendarDay } from '@/shared/calendar'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarDayCellProps = {
  day: CalendarDay
  isSelected: boolean
  isInRange: boolean
  tabIndex: number
  ariaLabel: string
  isToday: boolean
  isCurrentMonth: boolean
  isClosed: boolean
  windowCount: number
  onSelect: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const DeliveryWindowCalendarDayCell = ({
  day,
  isSelected,
  isInRange,
  tabIndex,
  ariaLabel,
  isToday,
  isCurrentMonth,
  isClosed,
  windowCount,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: DeliveryWindowCalendarDayCellProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { calendar } = shellScale

  const toneClass = !isCurrentMonth
    ? 'text-[var(--color-muted)]/45'
    : isSelected
      ? 'bg-[var(--color-dark-blue)] text-[var(--color-page)] '
      : isToday
        ? 'border-[rgba(131,204,185,0.28)] bg-[rgba(131,204,185,0.08)] text-[var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
        : isInRange
          ? 'bg-[var(--color-primary)]/10 text-[var(--color-text)]'
          : isClosed
            ? 'bg-[var(--color-muted)]/2 text-[var(--color-border-accent)]'
            : 'bg-transparent text-[var(--color-text)]'

  return (
    <CalendarDayCell
      day={day}
      isSelected={isSelected}
      isInRange={isInRange}
      onSelect={onSelect}
      tabIndex={tabIndex}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ariaLabel={ariaLabel}
      isToday={isToday}
      className={`relative flex flex-col items-center justify-center rounded-3xl border border-transparent outline-none transition-colors ${calendar.dayCellClassName} ${toneClass}`}
    >
      <span className={calendar.dayNumberClassName}>
        {isCurrentMonth ? day.date.getDate() : ''}
      </span>

      <div className="pointer-events-none ">
        {isCurrentMonth && windowCount > 0 ? (
          <span
            className={`${calendar.dayWindowCountClassName} ${isSelected ? calendar.dayWindowSelectedCountClassName : ''}`}
          >
            {windowCount}
          </span>
        ) : null}
      </div>

      {isCurrentMonth && isClosed ? (
        <span className={`pointer-events-none ${calendar.dayClosedClassName}`}>
          {calendar.dayClosedLabel}
        </span>
      ) : null}
    </CalendarDayCell>
  )
}
