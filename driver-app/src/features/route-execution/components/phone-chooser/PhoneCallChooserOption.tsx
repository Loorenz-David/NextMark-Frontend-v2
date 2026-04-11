import { PhoneIcon } from '@/assets/icons'
import type { PhoneCallOption as PhoneCallOptionValue } from '@/app/services/phoneCall.service'

type PhoneCallChooserOptionProps = {
  option: PhoneCallOptionValue
  onSelect: () => void
}

export function PhoneCallChooserOption({
  option,
  onSelect,
}: PhoneCallChooserOptionProps) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-white transition hover:bg-white/8 active:scale-[0.99]"
      onClick={onSelect}
      type="button"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/6">
        <PhoneIcon aria-hidden="true" className="h-5 w-5 text-white/85" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm text-white/60">{option.label}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-white">{option.displayValue}</span>
      </span>
    </button>
  )
}
