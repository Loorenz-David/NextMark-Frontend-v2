import type { Costumer } from '../../dto/costumer.dto'

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const CostumerDetailOperatingHoursSummary = ({ costumer }: { costumer: Costumer | null }) => {
  const rows = [...(costumer?.operating_hours ?? [])].sort((a, b) => a.weekday - b.weekday)

  return (
    <div className="h-[300px] overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border)] bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-[var(--color-text)]">Operating hours</div>

      {!rows.length ? (
        <div className="flex h-[230px] items-center justify-center text-sm text-[var(--color-muted)]">
          No operating hours set.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={`${row.client_id ?? 'day'}-${row.weekday}`} className="rounded-lg border border-[var(--color-border)]/70 p-3">
              <div className="text-sm font-medium text-[var(--color-text)]">
                {WEEKDAY_LABELS[row.weekday] ?? `Day ${row.weekday}`}
              </div>
              <div className="text-xs text-[var(--color-muted)]">
                {row.is_closed ? 'Closed' : `${row.open_time ?? '--:--'} - ${row.close_time ?? '--:--'}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

