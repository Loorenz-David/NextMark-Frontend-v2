export const normalizeItemPosition = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed : null
}
