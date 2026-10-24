const SHORT_BUILD_ID_LENGTH = 6

/**
 * "Build 412345 · 2026-10-24 18:05 UTC" — enough to tell two deploys apart on
 * the device without dev tools. UTC so the stamp reads the same on every device.
 */
export const formatBuildStamp = (buildId: string, builtAt: string): string => {
  const shortId = buildId.slice(-SHORT_BUILD_ID_LENGTH)
  const builtAtDate = new Date(builtAt)
  if (Number.isNaN(builtAtDate.getTime())) return `Build ${shortId}`

  const minuteIso = builtAtDate.toISOString().slice(0, 16).replace('T', ' ')
  return `Build ${shortId} · ${minuteIso} UTC`
}
