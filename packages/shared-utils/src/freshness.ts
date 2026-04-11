const parseTimestamp = (value?: string | null) => {
  if (!value) {
    return null
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const shouldRefreshForFreshness = (
  updatedAt?: string | null,
  freshAfter?: string | null,
) => {
  if (!freshAfter) {
    return false
  }

  const freshAfterTime = parseTimestamp(freshAfter)
  if (freshAfterTime == null) {
    return false
  }

  const updatedAtTime = parseTimestamp(updatedAt)
  if (updatedAtTime == null) {
    return true
  }

  return updatedAtTime < freshAfterTime
}
