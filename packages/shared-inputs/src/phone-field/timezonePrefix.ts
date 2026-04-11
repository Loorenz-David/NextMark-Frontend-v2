/**
 * Returns a phone prefix (e.g. "+1") derived from a timezone string such as
 * "America/New_York".  Falls back to null when no mapping is found.
 *
 * Only the most common timezone→country mappings are included.  The list is
 * intentionally kept small; country detection at this level is best-effort.
 */

const TIMEZONE_TO_PREFIX: Record<string, string> = {
  // Americas
  'America/New_York': '+1',
  'America/Chicago': '+1',
  'America/Denver': '+1',
  'America/Los_Angeles': '+1',
  'America/Anchorage': '+1',
  'Pacific/Honolulu': '+1',
  'America/Toronto': '+1',
  'America/Vancouver': '+1',
  'America/Sao_Paulo': '+55',
  'America/Argentina/Buenos_Aires': '+54',
  'America/Mexico_City': '+52',
  // Europe
  'Europe/London': '+44',
  'Europe/Dublin': '+353',
  'Europe/Paris': '+33',
  'Europe/Berlin': '+49',
  'Europe/Rome': '+39',
  'Europe/Madrid': '+34',
  'Europe/Amsterdam': '+31',
  'Europe/Brussels': '+32',
  'Europe/Zurich': '+41',
  'Europe/Vienna': '+43',
  'Europe/Stockholm': '+46',
  'Europe/Oslo': '+47',
  'Europe/Copenhagen': '+45',
  'Europe/Helsinki': '+358',
  'Europe/Warsaw': '+48',
  'Europe/Prague': '+420',
  'Europe/Budapest': '+36',
  'Europe/Bucharest': '+40',
  'Europe/Athens': '+30',
  'Europe/Lisbon': '+351',
  'Europe/Kiev': '+380',
  'Europe/Moscow': '+7',
  // Asia
  'Asia/Tokyo': '+81',
  'Asia/Shanghai': '+86',
  'Asia/Hong_Kong': '+852',
  'Asia/Singapore': '+65',
  'Asia/Seoul': '+82',
  'Asia/Kolkata': '+91',
  'Asia/Dubai': '+971',
  'Asia/Riyadh': '+966',
  'Asia/Bangkok': '+66',
  'Asia/Karachi': '+92',
  'Asia/Dhaka': '+880',
  'Asia/Jakarta': '+62',
  'Asia/Kuala_Lumpur': '+60',
  'Asia/Manila': '+63',
  'Asia/Beirut': '+961',
  'Asia/Kabul': '+93',
  // Africa / Oceania
  'Australia/Sydney': '+61',
  'Australia/Melbourne': '+61',
  'Pacific/Auckland': '+64',
  'Africa/Johannesburg': '+27',
  'Africa/Lagos': '+234',
  'Africa/Nairobi': '+254',
  'Africa/Cairo': '+20',
}

export function prefixFromTimezone(timezone: string): string | null {
  return TIMEZONE_TO_PREFIX[timezone] ?? null
}

export function prefixFromUserTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return prefixFromTimezone(tz)
  } catch {
    return null
  }
}
