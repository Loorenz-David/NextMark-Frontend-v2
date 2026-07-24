import { useEffect, useRef } from 'react'

import { useMapManager } from '@/shared/resource-manager/useResourceManager'

type MapPanelProps = {
  isRouteLoading?: boolean
}

export const MapPanel = ({ isRouteLoading = false }: MapPanelProps) => {
  const mapManager = useMapManager()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void mapManager.initialize(containerRef.current)
  }, [mapManager])

  return (
    <section className="absolute inset-0 h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {isRouteLoading ? (
        <div
          aria-label="Loading route"
          aria-live="polite"
          className="absolute inset-0 z-[60] flex items-center justify-center bg-[rgb(var(--theme-surface-map-panel-r))]/78 backdrop-blur-[2px]"
          role="status"
        >
          <p className="animate-pulse text-sm font-semibold tracking-[0.16em] text-text uppercase">
            Loading route
          </p>
        </div>
      ) : null}
    </section>
  )
}
