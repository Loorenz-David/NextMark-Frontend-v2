export const trimToMax = (value: string | number, max: number) =>
  typeof value === 'string' && value.length > max ? `${value.slice(0, max - 1)}…` : value

export const pluralLabel = (value: string, count: number) => {
  if (count > 1 || count === 0) {
    return value + 's'
  }

  return value
}
