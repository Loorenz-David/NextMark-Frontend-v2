const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const ZONE_COLOR_PRESETS = [
  '#111111',
  '#1f2937',
  '#374151',
  '#4b5563',
  '#0f766e',
  '#1d4ed8',
  '#7c3aed',
  '#be123c',
  '#c2410c',
  '#65a30d',
] as const

export const isValidZoneHexColor = (value: string | null | undefined): value is string =>
  typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim())

export const normalizeZoneHexColor = (value: string | null | undefined): string | null => {
  if (!isValidZoneHexColor(value)) {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length === 7) {
    return trimmed.toLowerCase()
  }

  const [r, g, b] = trimmed.slice(1).split('')
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
}
