type RefLike<T> = {
  current: T | null
}

export const makeInitialFormCopy = <T,>(
  ref: RefLike<T>,
  form: T | null,
) => {
  if (!form) return
  ref.current = structuredClone(form)
}
