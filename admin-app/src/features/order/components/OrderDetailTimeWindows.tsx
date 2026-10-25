import type { ReactNode } from 'react'

import type { Order } from '../types/order'
import { formatIsoDateFriendly, formatIsoTime } from '@/shared/utils/formatIsoDate'
import { TimeRangeCard } from './cards/TimeRangeCard'

type OrderDetailTimeWindowsProps = {
  order: Order | null
  headerRight?: ReactNode
}

export const OrderDetailTimeWindows = ({ order, headerRight }: OrderDetailTimeWindowsProps) => {
  const timeWindows: Record<string, Record<'start_at' | 'end_at', string>[]> = {}

  order?.delivery_windows?.forEach((t) => {
    const serializeDate = formatIsoDateFriendly(t.start_at)
    if (!serializeDate) return

    const start_at = formatIsoTime(t.start_at)!
    const end_at = formatIsoTime(t.end_at)!

    if (serializeDate in timeWindows) {
      timeWindows[serializeDate].push({start_at,end_at})
      return
    }
    timeWindows[serializeDate] = [{start_at,end_at}]
  })

  return (
    <div className="flex flex-col">
      {headerRight ? (
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          {headerRight}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 px-4 py-4">
        {order && order.delivery_windows?.length
          ? order.delivery_windows.map((t, i) => {
            const serializeDate = formatIsoDateFriendly(t.start_at)
            if (!serializeDate) return null
            const timeWindow = timeWindows[serializeDate]

            return (
              <div key={`order_time_window_group_${order.id}_${i}`}>
                <p className="text-micro font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {serializeDate}
                </p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {timeWindow.map((w, e) => (
                    <TimeRangeCard
                      key={`order_time_window_${order.id}_${i}_${e}`}
                      from={w.start_at}
                      to={w.end_at}
                    />
                  ))}
                </div>
              </div>
            )
          })
          : (
          <div className="flex min-h-32 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-subtle px-4 text-center">
            <span className="text-sm text-[var(--color-muted)]">
              No time windows set.
            </span>
          </div>
          )}
      </div>
    </div>
  )
}
