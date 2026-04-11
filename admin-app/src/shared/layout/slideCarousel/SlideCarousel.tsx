import { Children, useMemo, useState } from 'react'

import { BoldArrowIcon } from '@/assets/icons'

import { SlideCarouselDots } from './SlideCarouselDots'
import type { SlideCarouselProps } from './types'

export const SlideCarousel = ({ children, initialIndex = 0 }: SlideCarouselProps) => {
  const slides = useMemo(() => Children.toArray(children), [children])
  const total = slides.length

  const safeInitialIndex = total > 0 ? Math.max(0, Math.min(initialIndex, total - 1)) : 0
  const [index, setIndex] = useState(safeInitialIndex)

  const next = () => {
    setIndex((prev) => Math.min(prev + 1, total - 1))
  }

  const prev = () => {
    setIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="relative flex w-full flex-col gap-1">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex w-full items-start transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((child, childIndex) => (
            <div key={childIndex} className="w-full flex-shrink-0 self-start">
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center gap-1">
        <div className="flex flex-2 justify-end">
          {index > 0 ? (
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/[0.08]"
              aria-label="Previous slide"
            >
              <BoldArrowIcon className="h-3 w-3 rotate-180 text-[var(--color-text)]" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 justify-center">
          <SlideCarouselDots index={index} total={total} />
        </div>

        <div className="flex flex-2 justify-start">
          {index < total - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/[0.08]"
              aria-label="Next slide"
            >
              <BoldArrowIcon className="h-3 w-3 text-[var(--color-text)]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
