import {
  DRIVER_CUSTOM_FAILURE_NOTE_LABEL,
  DRIVER_FAILURE_NOTE_OPTIONS,
} from '../domain/failureNoteOptions'

type FailureReasonComposerProps = {
  value: string
  onValueChange: (value: string) => void
}

function CheckMarkIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" className={className}>
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      />
    </svg>
  )
}

export function FailureReasonComposer({
  value,
  onValueChange,
}: FailureReasonComposerProps) {
  const options = DRIVER_FAILURE_NOTE_OPTIONS
  const selectedOption = options.find((option) => option === value) ?? 'custom'

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selectedOption === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              onValueChange(option)
            }}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
              isSelected
                ? 'border-sky-300/40 bg-sky-400/12 text-white'
                : 'border-white/12 bg-white/6 text-white/80'
            }`}
          >
            <span
              className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? 'border-sky-300/90 bg-sky-400 text-white'
                  : 'border-sky-200/70 bg-sky-50 text-transparent'
              }`}
            >
              <CheckMarkIcon className="h-3 w-3" />
            </span>
            <span className="leading-6">{option}</span>
          </button>
        )
      })}

      <div
        className={`rounded-2xl border px-4 py-3 ${
          selectedOption === 'custom'
            ? 'border-sky-300/40 bg-sky-400/12'
            : 'border-white/12 bg-white/6'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (selectedOption !== 'custom') {
              onValueChange('')
            }
          }}
          className="mb-2 flex w-full items-center gap-3 text-left text-sm text-white/80"
        >
          <span
            className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              selectedOption === 'custom'
                ? 'border-sky-300/90 bg-sky-400 text-white'
                : 'border-sky-200/70 bg-sky-50 text-transparent'
            }`}
          >
            <CheckMarkIcon className="h-3 w-3" />
          </span>
          <span>{DRIVER_CUSTOM_FAILURE_NOTE_LABEL}</span>
        </button>

        <input
          type="text"
          value={selectedOption === 'custom' ? value : ''}
          onFocus={() => {
            if (selectedOption !== 'custom') {
              onValueChange('')
            }
          }}
          onChange={(event) => {
            onValueChange(event.target.value)
          }}
          className={`w-full rounded-xl border bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 ${
            selectedOption === 'custom'
              ? 'border-sky-300/40'
              : 'border-white/10'
          }`}
          placeholder="Type custom failure reason..."
        />
      </div>
    </div>
  )
}
