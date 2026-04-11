import { shouldUseRangePreview } from '../model/useCalendarModel'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runUseCalendarModelHoverPreviewTests = () => {
  const inProgress = shouldUseRangePreview({
    selectionMode: 'range',
    rangeValue: {
      start: new Date(2026, 2, 2),
      end: null,
    },
    hoveredDate: new Date(2026, 2, 6),
  })

  assert(inProgress, 'Hover preview should activate for in-progress range')

  const completeRange = shouldUseRangePreview({
    selectionMode: 'range',
    rangeValue: {
      start: new Date(2026, 2, 2),
      end: new Date(2026, 2, 6),
    },
    hoveredDate: new Date(2026, 2, 7),
  })

  assert(!completeRange, 'Hover preview should not override completed external range')

  const nonRangeMode = shouldUseRangePreview({
    selectionMode: 'single',
    rangeValue: {
      start: new Date(2026, 2, 2),
      end: null,
    },
    hoveredDate: new Date(2026, 2, 3),
  })

  assert(!nonRangeMode, 'Hover preview should be disabled in non-range modes')
}
