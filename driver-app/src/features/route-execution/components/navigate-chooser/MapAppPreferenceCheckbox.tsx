type MapAppPreferenceCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function MapAppPreferenceCheckbox({
  checked,
  onChange,
}: MapAppPreferenceCheckboxProps) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/80">
      <input
        checked={checked}
        className="h-4 w-4 accent-cyan-300"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>Don&apos;t ask again</span>
    </label>
  )
}
