import { TimeIcon } from '@/assets/icons'

import type { DeliveryWindowDisplayRow } from '../../../../flows/orderFormDeliveryWindows.flow'
import { formatLocalDateCardLabel } from '../../DeliveryWindowCalendarLayout.flow'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarWindowRowCardProps = {
  localDate: string
  row: DeliveryWindowDisplayRow
  onEdit: (row: DeliveryWindowDisplayRow) => void
  onRemove: (row: DeliveryWindowDisplayRow) => void
}

export const DeliveryWindowCalendarWindowRowCard = ({
  localDate,
  row,
  onEdit,
  onRemove,
}: DeliveryWindowCalendarWindowRowCardProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { list } = shellScale

  return (
    <div className={list.windowCardClassName}>
      <div className={list.windowMetaRowClassName}>
        <span className={list.groupDateClassName}>{formatLocalDateCardLabel(localDate)}</span>
        <div className={list.windowActionsClassName}>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className={list.editActionClassName}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onRemove(row)}
            className={list.removeActionClassName}
          >
            Remove
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(row)}
        className={`${list.windowItemClassName} w-full text-left`}
      >
        <span className={list.windowTimeClassName}>
          <TimeIcon className="h-3 w-3 text-[var(--color-light-blue)]" />
          <span>
            {row.start} - {row.end}
          </span>
        </span>
      </button>
    </div>
  )
}
