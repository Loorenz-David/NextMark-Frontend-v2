import { formatLocalDateCardLabel, formatNoSelectedDatesHelper } from '../../DeliveryWindowCalendarLayout.flow'
import type { SelectedDateSummary } from '../../DeliveryWindowCalendar.readModel.flow'
import type { DeliveryWindowCalendarDensity } from '../../DeliveryWindowCalendarDensity.flow'

type DeliveryWindowCalendarSelectedDatesCardProps = {
  summaries: SelectedDateSummary[]
  density?: DeliveryWindowCalendarDensity
}

export const DeliveryWindowCalendarSelectedDatesCard = ({
  summaries,
  density = 'regular',
}: DeliveryWindowCalendarSelectedDatesCardProps) => {
  const isCompact = density === 'compact'

  return (
    <section className={`${isCompact ? 'rounded-xl p-2.5' : 'rounded-2xl p-3 md:p-4'} border border-[var(--color-border-accent)] bg-[var(--color-page)]`}>
      <h3 className={`${isCompact ? 'text-sm' : 'text-base md:text-lg'} font-semibold text-[var(--color-text)]`}>Selected Dates</h3>

      {!summaries.length ? (
        <>
          <p className={`${isCompact ? 'text-xs' : 'text-sm md:text-base'} mt-1 text-[var(--color-muted)]`}>No dates selected</p>
          <div className={`${isCompact ? 'mt-4 text-xs' : 'mt-5 text-sm md:mt-7 md:text-base'} text-center text-[var(--color-muted)]`}>
            {formatNoSelectedDatesHelper()}
          </div>
        </>
      ) : (
        <div className={`${isCompact ? 'mt-2 gap-2' : 'mt-3 gap-2.5'} flex flex-col`}>
          <p className={`${isCompact ? 'text-xs' : 'text-sm md:text-base'} text-[var(--color-muted)]`}>
            {summaries.length} {summaries.length === 1 ? 'date' : 'dates'} selected
          </p>

          {summaries.map((entry) => (
            <div
              key={entry.localDate}
              className={`${isCompact ? 'rounded-lg px-2 py-1.5' : 'rounded-xl px-3 py-2'} flex items-center justify-between bg-[var(--color-accent)]/40`}
            >
              <span className={`${isCompact ? 'text-xs' : 'text-sm md:text-base'} font-semibold text-[var(--color-text)]`}>
                {formatLocalDateCardLabel(entry.localDate)}
              </span>
              <span className={`${isCompact ? 'min-w-6 rounded-md px-1.5 py-0 text-[10px]' : 'min-w-7 rounded-lg px-2 py-0.5 text-xs md:min-w-8 md:rounded-xl md:py-1 md:text-sm'} flex items-center justify-center bg-[var(--color-page)] font-semibold text-[var(--color-text)]`}>
                {entry.windowCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
