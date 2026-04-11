type ThreeDotMenuPanelProps = {
  children?: React.ReactNode
}

export function ThreeDotMenuPanel({ children }: ThreeDotMenuPanelProps) {
  return (
    <div
      className="flex flex-1 flex-col gap-3 px-5 py-5"
      data-bottom-sheet-gesture-lock="true"
    >
      {children ?? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-5 text-sm text-white/60">
          Add route menu options here.
        </div>
      )}
    </div>
  )
}
