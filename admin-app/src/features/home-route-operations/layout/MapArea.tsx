import type { ReactNode } from 'react'

interface MapAreaProps {
  map: ReactNode
  mapOverlay?: ReactNode
  buttonToggleMap?: ReactNode
}

export function MapArea({ map, mapOverlay, buttonToggleMap }: MapAreaProps) {
  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      {map}
      {mapOverlay}
      {buttonToggleMap ? (
        <div className="absolute right-0 top-0 z-20">{buttonToggleMap}</div>
      ) : null}
    </div>
  )
}
