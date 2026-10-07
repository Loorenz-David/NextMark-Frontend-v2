import { CurrentLocationIcon } from '@shared-icons'

type CurrentLocationCardProps = {
  label: string
  onSelect: () => void
  iconClassName?: string
}

export const CurrentLocationCard = ({ label, onSelect, iconClassName }: CurrentLocationCardProps) => {
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
        <CurrentLocationIcon className={`h-4 w-4 ${iconClassName ?? 'text-black'}`} />
        <span className="font-medium text-[var(--color-text)]">{label}</span>
      </button>
    </li>
  )
}
