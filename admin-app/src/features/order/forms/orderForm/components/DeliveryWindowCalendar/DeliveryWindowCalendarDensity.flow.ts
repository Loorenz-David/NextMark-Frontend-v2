import { useEffect, useState, type RefObject } from 'react'

export type DeliveryWindowCalendarDensity = 'compact' | 'regular'

const COMPACT_WIDTH_THRESHOLD = 620

export const resolveDeliveryWindowCalendarDensity = (width: number): DeliveryWindowCalendarDensity => {
  if (width > 0 && width <= COMPACT_WIDTH_THRESHOLD) {
    return 'compact'
  }
  return 'regular'
}

export const useDeliveryWindowCalendarDensity = (
  containerRef: RefObject<HTMLElement | null>,
): DeliveryWindowCalendarDensity => {
  const [density, setDensity] = useState<DeliveryWindowCalendarDensity>('regular')

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const update = () => {
      const width = node.getBoundingClientRect().width
      setDensity(resolveDeliveryWindowCalendarDensity(width))
    }

    update()

    const observer = new ResizeObserver(() => {
      update()
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  return density
}
