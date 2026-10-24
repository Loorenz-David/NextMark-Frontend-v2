export const verifyHexColor = (color: string | null | undefined): string | null => {
  if (!color) return null
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color) ? color : null
}
