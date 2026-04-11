export const formatNoSelectedDatesHelper = () => 'Click on dates to select them'

export const formatNoSelectedWindowsHelper = () => 'Select dates to view time windows'

export const formatLocalDateCardLabel = (localDate: string) => {
  const [year, month, day] = localDate.split('-').map(Number)
  if (!year || !month || !day) {
    return localDate
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day))
  return utcDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
