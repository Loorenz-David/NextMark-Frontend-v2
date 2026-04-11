export const validateString = (value: string | null): boolean =>
  Boolean(value && value.trim().length > 0)

export const validateEmail = (value: string | null) => {
  if (!value) return false
  if (!validateString(value)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
