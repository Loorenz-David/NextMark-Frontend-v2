import { APP_BUILD_ID, APP_BUILD_TIMESTAMP, formatBuildStamp } from '@/app/version'

const BUILD_STAMP = formatBuildStamp(APP_BUILD_ID, APP_BUILD_TIMESTAMP)

/**
 * Which build this device is running, readable without dev tools — the way to
 * confirm on an installed app that a deploy arrived.
 */
export const SettingsBuildStamp = ({ className = '' }: { className?: string }) => (
  <p className={`select-text text-micro tabular-nums text-[var(--color-muted)] ${className}`}>
    {BUILD_STAMP}
  </p>
)
