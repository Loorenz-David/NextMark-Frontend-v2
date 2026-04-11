import {
  buildWindowsFromLocalDates,
  localDateTimeToUtcIso,
  toDeliveryWindowDisplayRows,
  validateNonOverlappingUtcDeliveryWindows,
} from '../flows/orderFormDeliveryWindows.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderFormDeliveryWindowsFlowTests = () => {
  {
    const built = buildWindowsFromLocalDates({
      localDates: ['2026-03-05'],
      startTime: '09:00',
      endTime: '11:00',
      existingWindows: [],
      operatingHours: [],
      timeZone: 'UTC',
    })

    assert(!built.error, 'single date should build a delivery window')
    assert(built.nextWindows.length === 1, 'single date should create one window')
    assert(
      built.nextWindows[0]?.window_type === 'FULL_RANGE',
      'calendar-built window should use FULL_RANGE',
    )
  }

  {
    const withOverlap = buildWindowsFromLocalDates({
      localDates: ['2026-03-05'],
      startTime: '10:30',
      endTime: '12:00',
      existingWindows: [
        {
          start_at: '2026-03-05T09:00:00.000Z',
          end_at: '2026-03-05T11:00:00.000Z',
          window_type: 'FULL_RANGE',
        },
      ],
      operatingHours: [],
      timeZone: 'UTC',
    })
    assert(Boolean(withOverlap.error), 'overlap should return an error')
  }

  {
    const closedDay = buildWindowsFromLocalDates({
      localDates: ['2026-03-02'],
      startTime: '09:00',
      endTime: '11:00',
      existingWindows: [],
      operatingHours: [{ weekday: 0, is_closed: true }],
      timeZone: 'UTC',
    })
    assert(!closedDay.error, 'closed day should be skipped without hard error')
    assert(closedDay.nextWindows.length === 0, 'closed day should not add a window')
    assert(closedDay.skippedClosedDates.length === 1, 'closed day should be reported as skipped')
  }

  {
    const dstInvalid = localDateTimeToUtcIso('2026-03-29', '02:30', 'Europe/Stockholm')
    assert(dstInvalid === null, 'DST gap local time should be rejected')
  }

  {
    const rows = toDeliveryWindowDisplayRows(
      [
        {
          start_at: '2026-03-05T12:00:00.000Z',
          end_at: '2026-03-05T13:00:00.000Z',
          window_type: 'FULL_RANGE',
          client_id: 'dw-2',
        },
        {
          start_at: '2026-03-05T09:00:00.000Z',
          end_at: '2026-03-05T11:00:00.000Z',
          window_type: 'FULL_RANGE',
          client_id: 'dw-1',
        },
      ],
      'UTC',
    )
    assert(rows[0]?.clientId === 'dw-1', 'display rows should be sorted by start time')

    const overlap = validateNonOverlappingUtcDeliveryWindows([
      {
        start_at: '2026-03-05T09:00:00.000Z',
        end_at: '2026-03-05T11:00:00.000Z',
        window_type: 'FULL_RANGE',
      },
      {
        start_at: '2026-03-05T11:00:00.000Z',
        end_at: '2026-03-05T12:00:00.000Z',
        window_type: 'FULL_RANGE',
      },
    ])
    assert(overlap.valid, 'adjacent windows should be valid (non-overlapping)')
  }
}
