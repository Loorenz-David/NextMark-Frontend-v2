import type { DeliveryWindowDisplayRow } from '../../../../flows/orderFormDeliveryWindows.flow'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'
import { DeliveryWindowCalendarWindowRowCard } from '../cards/DeliveryWindowCalendarWindowRowCard'

type DeliveryWindowCalendarWindowsListProps = {
  rows: DeliveryWindowDisplayRow[]
  onClearAll: () => void
  onRemove: (row: DeliveryWindowDisplayRow) => void
  onEdit: (row: DeliveryWindowDisplayRow) => void
}

export const DeliveryWindowCalendarWindowsList = ({
  rows,
  onClearAll,
  onRemove,
  onEdit,
}: DeliveryWindowCalendarWindowsListProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { list } = shellScale

  const groupedRows = rows.reduce<Record<string, DeliveryWindowDisplayRow[]>>((acc, row) => {
    if (!acc[row.date]) {
      acc[row.date] = []
    }
    acc[row.date].push(row)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedRows).sort((a, b) => a.localeCompare(b))

  return (
    <div className={list.rootClassName}>
      <div >
        <div className={list.headerClassName}>
          <h3 className={list.titleClassName}>Time Windows</h3>
          <BasicButton
          params={{
            variant: 'text',
            onClick: onClearAll,
            className: list.clearActionClassName,
          }}
        >
          Clear
        </BasicButton>
        </div>
        
      </div>
      {rows.length ? (
        <div className={list.groupsClassName}>
          {sortedDates.map((localDate) => {
            const dayRows = [...groupedRows[localDate]].sort((a, b) => {
              if (a.start !== b.start) {
                return a.start.localeCompare(b.start)
              }
              return a.end.localeCompare(b.end)
            })

            return (
              <div key={localDate} className={list.groupClassName}>
                <div className={list.windowsStackClassName}>
                  {dayRows.map((row) => (
                    <DeliveryWindowCalendarWindowRowCard
                      key={row.key}
                      localDate={localDate}
                      row={row}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={list.emptyClassName}>No delivery windows selected yet.</div>
      )}
    </div>
  )
}
