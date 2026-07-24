/**
 * BackArrowIcon — inline SVG React component.
 *
 * Path data is derived from admin-app/src/assets/icons/BackArrowIcon2.svg.
 * Accepts `className` so callers can size it via Tailwind utilities
 * (e.g. `className="h-5 w-5"`). Colour is inherited from `currentColor`.
 */
type Props = {
  className?: string
}

export const BackArrowIcon = ({ className }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M6 12H18M6 12L11 7M6 12L11 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
