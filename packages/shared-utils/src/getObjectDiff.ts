type PlainObject = Record<string, unknown>

const isObject = (value: unknown): value is PlainObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) return true

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    return left.every((item, index) => isEqual(item, right[index]))
  }

  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    if (leftKeys.length !== rightKeys.length) return false

    return leftKeys.every((key) => isEqual(left[key], right[key]))
  }

  return false
}

export const getObjectDiff = <T extends PlainObject>(
  base: T | null | undefined,
  next: T | null | undefined,
): Partial<T> => {
  if (!base || !next) return {}

  const diff: Partial<T> = {}
  const keys = new Set([...Object.keys(base), ...Object.keys(next)])

  keys.forEach((key) => {
    const baseValue = base[key]
    const nextValue = next[key]
    if (!isEqual(baseValue, nextValue)) {
      diff[key as keyof T] = nextValue as T[keyof T]
    }
  })

  return diff
}
