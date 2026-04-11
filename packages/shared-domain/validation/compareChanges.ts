type RefLike<T> = {
  current: T | null
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const areValuesEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) return true

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    return left.every((item, index) => areValuesEqual(item, right[index]))
  }

  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    if (leftKeys.length !== rightKeys.length) return false

    return leftKeys.every((key) => areValuesEqual(left[key], right[key]))
  }

  return false
}

export const hasFormChanges = <T,>(
  form: T,
  ref: RefLike<T>,
) => {
  if (!ref.current) return false

  return !areValuesEqual(form, ref.current)
}

export const areObjectsEqual = <T,>(first: T, second: T) => {
  return areValuesEqual(first, second)
}
