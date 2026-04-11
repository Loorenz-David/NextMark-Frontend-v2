import type { DeliveryWindowDisplayRow } from '../../flows/orderFormDeliveryWindows.flow'

export const groupDeliveryWindowsByLocalDate = (rows: DeliveryWindowDisplayRow[]) => {
  return rows.reduce<Record<string, DeliveryWindowDisplayRow[]>>((acc, row) => {
    if (!acc[row.date]) {
      acc[row.date] = []
    }
    acc[row.date].push(row)
    return acc
  }, {})
}

export const getDeliveryWindowsForLocalDate = ({
  windowsByDate,
  localDate,
}: {
  windowsByDate: Record<string, DeliveryWindowDisplayRow[]>
  localDate: string
}) => windowsByDate[localDate] ?? []

export const buildDayWindowCountLabel = (count: number) =>
  `${count} window${count === 1 ? '' : 's'}`
