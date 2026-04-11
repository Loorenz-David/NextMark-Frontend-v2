import type { ReactNode } from 'react'

interface MapAreaProps {
  map: ReactNode
  mapOverlay?: ReactNode
}

export function MapArea({ map, mapOverlay }: MapAreaProps) {
  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      {map}
      {mapOverlay}
    </div>
  )
}
