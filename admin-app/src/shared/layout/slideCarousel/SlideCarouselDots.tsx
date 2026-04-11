type SlideCarouselDotsProps = {
  index: number
  total: number
}

export const SlideCarouselDots = ({ index, total }: SlideCarouselDotsProps) => {
  if (total <= 1) {
    return null
  }

  return (
    <div className="flex justify-center py-3">
      <div className="flex items-center gap-2 rounded-full bg-[var(--color-muted)]/20 px-3 py-1 h-4">
        {Array.from({ length: total }).map((_, dotIndex) => (
          <div
            key={dotIndex}
            className={` rounded-full transition-all ${
              dotIndex === index
                ?'bg-[var(--color-muted)]/40 h-2 w-2'
                : 'bg-[var(--color-page)] h-1 w-1'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

