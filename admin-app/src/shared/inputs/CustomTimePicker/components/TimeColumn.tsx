import { useCallback, useMemo } from 'react'

import { useSnapScroll } from '../hooks/useSnapScroll'

type TimeColumnProps = {
  label: string
  values: number[]
  value: number
  onChange: (value: number) => void
  isValueDisabled?: (value: number) => boolean
  itemHeight?: number
  visibleCount?: number
  formatter?: (value: number) => string
}

const SCALE_STEPS = [1, 0.92, 0.86, 0.8]
const OPACITY_STEPS = [1, 0.65, 0.35, 0.15]

const getVisualStyleByDistance = (distance: number) => {
  const index = Math.min(distance, SCALE_STEPS.length - 1)
  return {
    transform: `scale(${SCALE_STEPS[index]})`,
    opacity: OPACITY_STEPS[index],
  }
}

export const TimeColumn = ({
  label,
  values,
  value,
  onChange,
  isValueDisabled,
  itemHeight = 36,
  visibleCount = 5,
  formatter,
}: TimeColumnProps) => {
  const topBottomPadding = useMemo(
    () => ((visibleCount - 1) / 2) * itemHeight,
    [itemHeight, visibleCount],
  )

  const {
    scrollRef,
    selectedIndex,
    scrollToValue,
    onWheel,
    onScroll,
    onPointerEnter,
    onPointerLeave,
  } = useSnapScroll({
    values,
    value,
    itemHeight,
    onChange,
    isValueDisabled,
  })

  const setScrollNode = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node
    if (node) {
      scrollToValue(value, 'auto')
    }
  }, [scrollRef, scrollToValue, value])

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </div>
      <div
        className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-[linear-gradient(180deg,rgba(23,35,36,0.92),rgba(18,27,28,0.9))]"
        style={{ height: itemHeight * visibleCount }}
      >
        <div
          className="pointer-events-none absolute inset-x-1 z-10 rounded-md border border-[rgb(var(--color-light-blue-r),0.18)] bg-[rgb(var(--color-light-blue-r),0.08)]"
          style={{
            top: topBottomPadding,
            height: itemHeight,
          }}
        />

        <div
          ref={setScrollNode}
          role="listbox"
          aria-label={label}
          className="h-full overflow-y-auto scroll-thin"
          style={{
            paddingTop: topBottomPadding,
            paddingBottom: topBottomPadding,
            scrollbarWidth: 'none',
          }}
          onWheel={onWheel}
          onScroll={onScroll}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          {values.map((entry, index) => {
            const distance = Math.abs(index - selectedIndex)
            const visual = getVisualStyleByDistance(distance)
            const isDisabled = isValueDisabled?.(entry) ?? false

            return (
              <button
                key={`${label}-${entry}`}
                type="button"
                role="option"
                disabled={isDisabled}
                aria-selected={entry === value}
                onClick={() => {
                  if (isDisabled) {
                    return
                  }
                  onChange(entry)
                }}
                className={`flex w-full items-center justify-center px-2 text-sm transition-[transform,opacity] duration-150 ${isDisabled ? 'cursor-not-allowed text-[var(--color-muted)]/70' : 'text-[var(--color-text)]'}`}
                style={{
                  height: itemHeight,
                  ...visual,
                  opacity: isDisabled
                    ? Math.max((visual.opacity ?? 1) * 0.8, 0.3)
                    : visual.opacity,
                }}
              >
                {formatter ? formatter(entry) : entry}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
