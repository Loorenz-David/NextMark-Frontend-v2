import { CurrentLocationIconSrc } from '@/assets/icons'
import { CURRENT_LOCATION_SUGGESTION } from '../constants/currentLocationSuggestion'

type CurrentLocationCardProps = {
  onSelect: () => void
}

export const CurrentLocationCard = ({ onSelect }: CurrentLocationCardProps) => {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-3 text-left text-xs hover:bg-[var(--color-ligth-bg)] cursor-pointer"
        onMouseDown={(event) => {
          event.preventDefault()
          onSelect()
        }}
      >
        <img
          alt="Current location"
          className="h-4 w-4"
          src={CurrentLocationIconSrc}
        />
        <span className="font-medium text-[var(--color-text)]">{CURRENT_LOCATION_SUGGESTION.label}</span>
      </button>
    </li>
  )
}
