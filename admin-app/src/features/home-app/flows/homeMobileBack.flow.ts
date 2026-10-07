import { useEffect, useRef } from 'react'

import {
  countHomeMobileLayers,
  resolveHomeMobileBackTarget,
} from '../domain/homeMobileShell.domain'
import type { HomeMobileLayer, HomeMobileLayerCounts } from '../domain/homeMobileShell.types'

const HISTORY_DEPTH_KEY = 'homeMobileDepth'

type HistoryState = Record<string, unknown> | null

const readHistoryDepth = (state: unknown): number => {
  if (!state || typeof state !== 'object') return 0
  const value = (state as Record<string, unknown>)[HISTORY_DEPTH_KEY]
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

const withDepth = (state: HistoryState, depth: number): Record<string, unknown> => ({
  ...(state && typeof state === 'object' ? state : {}),
  [HISTORY_DEPTH_KEY]: depth,
})

const decrement = (layers: HomeMobileLayerCounts, layer: HomeMobileLayer): HomeMobileLayerCounts => {
  switch (layer) {
    case 'popup':
      return { ...layers, popups: Math.max(0, layers.popups - 1) }
    case 'sheet':
      return { ...layers, sheets: Math.max(0, layers.sheets - 1) }
    case 'section':
      return { ...layers, sections: Math.max(0, layers.sections - 1) }
    case 'base':
      return { ...layers, base: false }
  }
}

type UseHomeMobileBackFlowParams = {
  enabled: boolean
  layers: HomeMobileLayerCounts
  closeLayer: (layer: HomeMobileLayer) => void
}

/**
 * Makes the browser/hardware back button peel layers off the phone shell
 * instead of leaving the app.
 *
 * Every layer that opens pushes one history entry tagged with the resulting
 * depth. A `popstate` that lands on a shallower depth closes layers, highest
 * priority first, until the shell matches it. Layers closed from the UI pop
 * their own entries with `history.go`, and the `popstate` that produces is
 * ignored so the two paths never double-close.
 */
export const useHomeMobileBackFlow = ({
  enabled,
  layers,
  closeLayer,
}: UseHomeMobileBackFlowParams): void => {
  const depth = countHomeMobileLayers(layers)
  const depthRef = useRef(0)
  const layersRef = useRef(layers)
  const closeLayerRef = useRef(closeLayer)
  const selfPopsRef = useRef(0)
  const didNormaliseRef = useRef(false)
  layersRef.current = layers
  closeLayerRef.current = closeLayer

  // Normalise stale entries left by a reload or a route change that happened
  // with layers open: rewind to the depth-0 entry so one back press leaves.
  // Guarded so a StrictMode double-mount cannot rewind twice.
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || didNormaliseRef.current) return
    didNormaliseRef.current = true
    const staleDepth = readHistoryDepth(window.history.state)
    if (staleDepth > 0) {
      selfPopsRef.current += 1
      window.history.go(-staleDepth)
    } else {
      window.history.replaceState(withDepth(window.history.state, 0), '')
    }
    depthRef.current = 0
  }, [enabled])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const previous = depthRef.current
    if (depth === previous) return
    depthRef.current = depth

    if (depth > previous) {
      for (let next = previous + 1; next <= depth; next += 1) {
        window.history.pushState(withDepth(window.history.state, next), '')
      }
      return
    }

    // Closed from the UI: drop the matching entries without re-closing.
    selfPopsRef.current += 1
    window.history.go(depth - previous)
  }, [depth, enabled])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handlePopState = (event: PopStateEvent) => {
      if (selfPopsRef.current > 0) {
        selfPopsRef.current -= 1
        return
      }

      const target = readHistoryDepth(event.state)
      const current = depthRef.current
      if (target >= current) return

      let remaining = layersRef.current
      for (let step = current; step > target; step -= 1) {
        const layer = resolveHomeMobileBackTarget(remaining)
        if (!layer) break
        closeLayerRef.current(layer)
        remaining = decrement(remaining, layer)
      }
      depthRef.current = target
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [enabled])
}
