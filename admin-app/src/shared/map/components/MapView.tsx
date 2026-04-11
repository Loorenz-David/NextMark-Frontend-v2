import { useEffect, useRef } from 'react'

import type { MapConfig } from '../domain/types'
import type { MapOrder } from '../domain/entities/MapOrder'
import type { Route } from '../domain/entities/Route'
import { useMap } from '../hooks/useMap'

type MapViewProps = {
  orders: MapOrder[]
  route: Route | null
  options?: MapConfig
  className?: string
}

export const MapView = ({ orders, route, options, className }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { initialize, showOrders, showRoute } = useMap(options)

  useEffect(() => {
    void initialize(containerRef.current, options)
  }, [initialize])

  useEffect(() => {
    showOrders(orders)
  }, [orders, showOrders])

  useEffect(() => {
    showRoute(route)
  }, [route, showRoute])

  return <div ref={containerRef} className={className} />
}
