type ThreeDotMenuProps = {
  onClick: () => void
}

export function ThreeDotMenu({ onClick }: ThreeDotMenuProps) {
  return (
    <button
      aria-label="Open route options"
      className="flex h-10 w-10 shrink-0 items-center justify-center  text-white transition active:scale-[0.98]"
      onClick={onClick}
      type="button"
    >
      <span className="flex flex-col gap-1">
        <Circle />
        <Circle />
        <Circle />
      </span>
    </button>
  )
}

function Circle() {
  return <span className="h-1 w-1 rounded-full bg-[rgb(var(--bg-strong-light))]" />
}
