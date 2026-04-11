export type GroupPlacement = 'before' | 'after'

type RectLike = {
  top?: number
  height?: number
} | null | undefined

const toFiniteNumber = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

type DragEndLikeEvent = {
  activatorEvent?: Event | null
  active?: {
    rect?: {
      current?: {
        translated?: {
          top?: number
          height?: number
        } | null
      } | null
    } | null
  } | null
}

const resolveFromTranslatedRectCenter = (event: DragEndLikeEvent | null | undefined): number | null => {
  const translatedTop = toFiniteNumber(event?.active?.rect?.current?.translated?.top)
  const translatedHeight = toFiniteNumber(event?.active?.rect?.current?.translated?.height)
  if (translatedTop == null || translatedHeight == null || translatedHeight <= 0) {
    return null
  }
  return translatedTop + (translatedHeight / 2)
}

export const resolvePointerClientY = (event: DragEndLikeEvent | Event | null | undefined): number | null => {
  const fromTranslated = resolveFromTranslatedRectCenter(event as DragEndLikeEvent)
  if (fromTranslated != null) {
    return fromTranslated
  }

  const sourceEvent = (event as DragEndLikeEvent)?.activatorEvent ?? event
  if (!sourceEvent) return null

  if (sourceEvent instanceof MouseEvent) {
    return toFiniteNumber(sourceEvent.clientY)
  }

  if (typeof TouchEvent !== 'undefined' && sourceEvent instanceof TouchEvent) {
    const touch = sourceEvent.changedTouches?.[0] ?? sourceEvent.touches?.[0]
    return toFiniteNumber(touch?.clientY)
  }

  return null
}

export const resolveGroupPlacement = (
  pointerY: number | null,
  overRect: RectLike,
): GroupPlacement => {
  if (pointerY == null) {
    return 'after'
  }

  const top = toFiniteNumber(overRect?.top)
  const height = toFiniteNumber(overRect?.height)
  if (top == null || height == null || height <= 0) {
    return 'after'
  }

  const midpoint = top + (height / 2)
  return pointerY < midpoint ? 'before' : 'after'
}
