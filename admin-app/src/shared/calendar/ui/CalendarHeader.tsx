export type CalendarHeaderProps = {
  visibleMonth: Date
  nextMonth: () => void
  prevMonth: () => void
  goToToday?: () => void
}

export const CalendarHeader = ({
  visibleMonth,
  nextMonth,
  prevMonth,
  goToToday,
}: CalendarHeaderProps) => {
  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div data-calendar-header='true'>
      <button type='button' onClick={prevMonth}>
        Prev
      </button>
      <div>{monthLabel}</div>
      <button type='button' onClick={nextMonth}>
        Next
      </button>
      {goToToday ? (
        <button type='button' onClick={goToToday}>
          Today
        </button>
      ) : null}
    </div>
  )
}
