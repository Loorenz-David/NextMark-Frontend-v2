import type { PhonePrefixOption } from './phonePrefixes'
import { getFlagEmoji } from './phonePrefixes'

type PhonePrefixCardProps = {
  prefixOption: PhonePrefixOption
  onSelectPrefix: (prefixOption: PhonePrefixOption) => void
  isSelected: boolean
}

export const PhonePrefixCard = ({
  prefixOption,
  isSelected,
  onSelectPrefix,
}: PhonePrefixCardProps) => {
  return (
    <li>
      <button
        type="button"
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
          isSelected
            ? 'bg-[#83ccb9]/12 text-white'
            : 'text-white/88 hover:bg-white/10'
        }`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelectPrefix(prefixOption)}
      >
        <span className="text-base leading-none" aria-hidden>
          {getFlagEmoji(prefixOption.countryCode)}
        </span>
        <span className="text-sm font-medium">
          {prefixOption.display}
        </span>
        {isSelected && (
          <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[#16c060]" />
        )}
      </button>
    </li>
  )
}
