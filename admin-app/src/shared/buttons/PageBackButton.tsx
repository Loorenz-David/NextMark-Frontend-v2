import { cn } from '../../lib/utils/cn'

type PageBackButtonProps = {
  onClick: () => void
  ariaLabel?: string
  /** Extra classes, e.g. a text colour for headers on a dark background. */
  className?: string
}

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M15 5.5 8.5 12l6.5 6.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * The one way a pushed page closes on a phone: a finger-sized chevron at
 * the start of the page header. Every page header renders this on mobile
 * instead of its desktop "Close" button so the gesture is the same
 * everywhere.
 */
export const PageBackButton = ({ onClick, ariaLabel = 'Back', className }: PageBackButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      '-ml-2 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-text)] transition-colors active:bg-surface-hover',
      className,
    )}
  >
    <ChevronLeftIcon className="h-6 w-6" />
  </button>
)
