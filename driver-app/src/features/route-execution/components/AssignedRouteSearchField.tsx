type AssignedRouteSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  placeholder?: string
  autoFocus?: boolean
  readOnly?: boolean
}

export function AssignedRouteSearchField({
  value,
  onChange,
  onFocus,
  placeholder = 'Search orders',
  autoFocus = false,
  readOnly = false,
}: AssignedRouteSearchFieldProps) {
  return (
    <label
      className="flex min-h-9 min-w-0 items-center gap-3 rounded-xl border px-4"
      style={{ backgroundColor: 'rgba(var(--bg-strong-light), 0.08)', borderColor: 'rgba(255, 255, 255, 0.28)' }}
      htmlFor="assigned-route-search"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-white/65"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M21 21L16.65 16.65M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>

      <input
        autoFocus={autoFocus}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-white/55"
        id="assigned-route-search"
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        readOnly={readOnly}
        type="text"
        value={value}
      />
    </label>
  )
}
