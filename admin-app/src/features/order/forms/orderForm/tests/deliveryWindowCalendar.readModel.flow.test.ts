import {
  buildSelectedDateSummaries,
  buildSelectedDateWindowGroups,
  buildTimeWindowsCardModel,
} from '../components/DeliveryWindowCalendar/DeliveryWindowCalendar.readModel.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runDeliveryWindowCalendarReadModelFlowTests = () => {
  const windowsByDate = {
    '2026-03-05': [
      {
        key: 'w-2',
        date: '2026-03-05',
        start: '11:00',
        end: '12:00',
        startAtUtc: '2026-03-05T11:00:00.000Z',
        endAtUtc: '2026-03-05T12:00:00.000Z',
        windowType: 'FULL_RANGE' as const,
        clientId: 'w-2',
      },
      {
        key: 'w-1',
        date: '2026-03-05',
        start: '09:00',
        end: '10:00',
        startAtUtc: '2026-03-05T09:00:00.000Z',
        endAtUtc: '2026-03-05T10:00:00.000Z',
        windowType: 'FULL_RANGE' as const,
        clientId: 'w-1',
      },
    ],
    '2026-03-06': [],
  }

  const selectedDates = ['2026-03-06', '2026-03-05']

  {
    const summaries = buildSelectedDateSummaries({ selectedDates, windowsByDate })
    assert(summaries[0]?.localDate === '2026-03-05', 'summaries should be sorted by local date')
    assert(summaries[0]?.windowCount === 2, 'summary should include window count by date')
    assert(summaries[1]?.windowCount === 0, 'summary should include zero-count selected dates')
  }

  {
    const groups = buildSelectedDateWindowGroups({ selectedDates, windowsByDate })
    assert(groups.length === 2, 'groups should be created per selected date')
    assert(groups[0]?.windows[0]?.start === '09:00', 'windows in group should be sorted by start time')
  }

  {
    const cardNoSelection = buildTimeWindowsCardModel({ selectedDates: [], groups: [] })
    assert(!cardNoSelection.hasSelection, 'card model should mark missing selection')
    assert(
      cardNoSelection.helperText === 'Select dates to view time windows',
      'card model should provide empty selection helper text',
    )

    const cardWithSelection = buildTimeWindowsCardModel({
      selectedDates: ['2026-03-05'],
      groups: [{ localDate: '2026-03-05', windows: windowsByDate['2026-03-05'] ?? [] }],
    })

    assert(cardWithSelection.hasSelection, 'card model should mark available selection')
    assert(cardWithSelection.hasAnyWindows, 'card model should detect available windows')
  }
}
