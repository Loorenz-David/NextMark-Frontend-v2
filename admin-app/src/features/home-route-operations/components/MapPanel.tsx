import { useEffect, useRef } from 'react'

import type { MapConfig } from '@/shared/map'
import { useMapManager } from '@/shared/resource-manager/useResourceManager'

const DEFAULT_MAP_CONFIG: MapConfig = {
  center: { lat: 0, lng: 0 },
  zoom: 2,
  disableDefaultUI: true,
}

export const MapPanel = () => {
  const mapManager = useMapManager()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void mapManager.initialize(containerRef.current, DEFAULT_MAP_CONFIG)
  }, [mapManager])

  return (
    <section className="w-full h-full">
      <div ref={containerRef} className="h-full w-full" />
    </section>
  )
}
