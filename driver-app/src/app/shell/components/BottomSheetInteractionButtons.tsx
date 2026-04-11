import { CurrentLocationIcon } from '@/assets/icons'

type BottomSheetInteractionButtonsProps = {
  shouldRender: boolean
  opacity: number
  translateYPx: number
  isInteractive: boolean
  isLocatingCurrentLocation: boolean
  onLocateCurrentLocation: () => void
}

export function BottomSheetInteractionButtons({
  shouldRender,
  opacity,
  translateYPx,
  isInteractive,
  isLocatingCurrentLocation,
  onLocateCurrentLocation,
}: BottomSheetInteractionButtonsProps) {
  if (!shouldRender) {
    return null
  }

  return (
    <div
      className="driver-bottom-sheet__actions-strip is-visible"
      style={{
        opacity,
        transform: `translateY(calc(-100% - 0.85rem - ${translateYPx}px))`,
        pointerEvents: isInteractive ? 'auto' : 'none',
      }}
    >
      <button
        className="rounded-full bg-[rgba(var(--bg-app-color),0.70)] p-3 backdrop-blur-[18px] backdrop-saturate-[115%] backdrop-contrast-[92%]"
        disabled={isLocatingCurrentLocation}
        onClick={onLocateCurrentLocation}
        type="button"
      >
        <CurrentLocationIcon
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-[rgb(var(--bg-strong-light))]"
        />

      </button>
    </div>
  )
}
