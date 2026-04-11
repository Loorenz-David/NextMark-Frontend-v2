import type { SavedLocation } from '../types'

type SavedLocationCardProps = {
  savedLocation: SavedLocation
  onSelect: (value: SavedLocation) => void
}

export const SavedLocationCard = ({ savedLocation, onSelect }: SavedLocationCardProps) => {
  return (
    <li>
      <button
        type="button"
        className="flex w-full flex-col gap-0.5 px-3 py-3 text-left text-xs hover:bg-[var(--color-ligth-bg)] cursor-pointer"
        onMouseDown={(event) => {
          event.preventDefault()
          onSelect(savedLocation)
        }}
      >
        <span className="font-medium text-[var(--color-text)]">
          {savedLocation.label || savedLocation.address.street_address}
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          {savedLocation.address.country}, {savedLocation.address.city}
        </span>
      </button>
    </li>
  )
}
