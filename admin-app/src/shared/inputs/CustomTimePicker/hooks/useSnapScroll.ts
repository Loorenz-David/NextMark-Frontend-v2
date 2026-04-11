import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type UseSnapScrollParams = {
  values: number[]
  value: number
  itemHeight: number
  onChange: (nextValue: number) => void
  isValueDisabled?: (value: number) => boolean
}

export const useSnapScroll = ({
  values,
  value,
  itemHeight,
  onChange,
  isValueDisabled,
}: UseSnapScrollParams) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const wheelCaptureRef = useRef(false)
  const isUserScrollingRef = useRef(false)
  const suppressNextScrollRef = useRef(false)
  const [visualIndex, setVisualIndex] = useState(0)

  const selectedIndex = useMemo(() => {
    const index = values.indexOf(value)
    return index >= 0 ? index : 0
  }, [value, values])

  useEffect(() => {
    if (isUserScrollingRef.current) {
      return
    }
    setVisualIndex(selectedIndex)
  }, [selectedIndex])

  const resolveNearestEnabledIndex = useCallback((requestedIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(values.length - 1, requestedIndex))
    const requestedValue = values[clampedIndex]
    if (!isValueDisabled?.(requestedValue)) {
      return clampedIndex
    }

    for (let offset = 1; offset < values.length; offset += 1) {
      const forwardIndex = clampedIndex + offset
      if (forwardIndex < values.length && !isValueDisabled?.(values[forwardIndex])) {
        return forwardIndex
      }

      const backwardIndex = clampedIndex - offset
      if (backwardIndex >= 0 && !isValueDisabled?.(values[backwardIndex])) {
        return backwardIndex
      }
    }

    return clampedIndex
  }, [isValueDisabled, values])

  const scrollToIndex = useCallback(
    (
      index: number,
      behavior: ScrollBehavior = 'smooth',
      suppressScrollHandler = false,
    ) => {
      const node = scrollRef.current
      if (!node) {
        return
      }

      const clampedIndex = resolveNearestEnabledIndex(index)
      setVisualIndex(clampedIndex)
      if (suppressScrollHandler) {
        suppressNextScrollRef.current = true
      }
      node.scrollTo({
        top: clampedIndex * itemHeight,
        behavior,
      })
    },
    [itemHeight, resolveNearestEnabledIndex],
  )

  const scrollToValue = useCallback(
    (nextValue: number, behavior: ScrollBehavior = 'smooth') => {
      const index = values.indexOf(nextValue)
      if (index < 0) {
        return
      }
      scrollToIndex(index, behavior)
    },
    [scrollToIndex, values],
  )

  useEffect(() => {
    if (isUserScrollingRef.current) {
      return
    }
    scrollToValue(value, 'auto')
  }, [scrollToValue, value])

  const snapToNearest = useCallback(() => {
    const node = scrollRef.current
    if (!node) {
      isUserScrollingRef.current = false
      return
    }

    const nearestIndex = Math.round(node.scrollTop / itemHeight)
    const clampedIndex = resolveNearestEnabledIndex(nearestIndex)
    const nextValue = values[clampedIndex]
    setVisualIndex(clampedIndex)

    if (nextValue !== value && !isValueDisabled?.(nextValue)) {
      onChange(nextValue)
    }
    scrollToIndex(clampedIndex, 'auto', true)
    isUserScrollingRef.current = false
  }, [isValueDisabled, itemHeight, onChange, resolveNearestEnabledIndex, scrollToIndex, value, values])

  const onWheel = useCallback(
    () => {
      if (!wheelCaptureRef.current) {
        return
      }
      isUserScrollingRef.current = true
    },
    [],
  )

  const onScroll = useCallback(() => {
    if (suppressNextScrollRef.current) {
      suppressNextScrollRef.current = false
      return
    }

    isUserScrollingRef.current = true
    const node = scrollRef.current
    if (node) {
      const nearestIndex = Math.round(node.scrollTop / itemHeight)
      const clampedIndex = resolveNearestEnabledIndex(nearestIndex)
      setVisualIndex(clampedIndex)
      const nextValue = values[clampedIndex]
      if (nextValue !== value && !isValueDisabled?.(nextValue)) {
        onChange(nextValue)
      }
    }
  }, [isValueDisabled, itemHeight, onChange, resolveNearestEnabledIndex, value, values])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) {
      return
    }

    const handleScrollEnd = () => {
      snapToNearest()
    }

    node.addEventListener('scrollend', handleScrollEnd as EventListener)
    return () => {
      node.removeEventListener('scrollend', handleScrollEnd as EventListener)
    }
  }, [snapToNearest])

  const onPointerEnter = useCallback(() => {
    wheelCaptureRef.current = true
  }, [])

  const onPointerLeave = useCallback(() => {
    wheelCaptureRef.current = false
  }, [])

  return {
    scrollRef,
    selectedIndex: visualIndex,
    scrollToValue,
    onWheel,
    onScroll,
    onPointerEnter,
    onPointerLeave,
  }
}
