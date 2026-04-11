const DEFAULT_BLOCK_MESSAGE =
  'This route has already ended and cannot be optimized. Update the delivery plan end date to a future time to re-optimize.'

export const getRouteOptimizationBlockMessage = () => DEFAULT_BLOCK_MESSAGE

export const isEndDateInFuture = (endDate?: string | null) => {
  if (!endDate) return true
  const parsed = new Date(endDate)

  if (Number.isNaN(parsed.getTime())) return true
  return parsed.getTime() > Date.now()
}
