import type { PhoneCallOption as PhoneCallOptionValue } from '@/app/services/phoneCall.service'
import { PhoneCallChooserOption } from './PhoneCallChooserOption'

type PhoneCallChooserListProps = {
  options: PhoneCallOptionValue[]
  onSelectOption: (option: PhoneCallOptionValue) => void
}

export function PhoneCallChooserList({
  options,
  onSelectOption,
}: PhoneCallChooserListProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <PhoneCallChooserOption
          key={option.id}
          onSelect={() => onSelectOption(option)}
          option={option}
        />
      ))}
    </div>
  )
}
