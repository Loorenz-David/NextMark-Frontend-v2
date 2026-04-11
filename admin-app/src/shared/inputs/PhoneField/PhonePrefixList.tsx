import { PhonePrefixCard } from './PhonePrefixCard'
import { usePhoneFieldContext } from './PhoneField.context'

export const PhonePrefixList = () => {
  const { filteredPrefixes, handleSelectPrefix, selectedPrefix } = usePhoneFieldContext()

  if (!filteredPrefixes.length) {
    return (
      <div className="px-3 py-2 text-sm text-white/46">
        No prefixes found.
      </div>
    )
  }

  return (
    <ul className="overflow-y-scroll max-h-[200px]"

    >
      {filteredPrefixes.map((prefixOption) => {
        const isSelected = prefixOption.value === selectedPrefix?.value
        return (
          <PhonePrefixCard
            key={prefixOption.value}
            prefixOption={prefixOption}
            isSelected={isSelected}
            onSelectPrefix={handleSelectPrefix}
          />
        )
      })}
    </ul>
  )
}
