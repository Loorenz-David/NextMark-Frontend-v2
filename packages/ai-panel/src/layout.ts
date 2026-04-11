export interface FloatingPoint {
  x: number
  y: number
}

export interface FloatingSize {
  width: number
  height: number
}

export interface FloatingViewport {
  width: number
  height: number
}

export interface PersistedAiPanelLayout {
  isOpen: boolean
  launcherPosition: FloatingPoint
}

export interface PersistedAiPanelThread {
  threadId: string
}

export function readViewport(): FloatingViewport {
  if (typeof window === 'undefined') {
    return { width: 1440, height: 900 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function clampFloatingPoint(
  point: FloatingPoint,
  size: FloatingSize,
  viewport: FloatingViewport,
  margin: number,
): FloatingPoint {
  const maxX = Math.max(margin, viewport.width - size.width - margin)
  const maxY = Math.max(margin, viewport.height - size.height - margin)

  return {
    x: Math.min(Math.max(point.x, margin), maxX),
    y: Math.min(Math.max(point.y, margin), maxY),
  }
}

/**
 * Computes where the panel should open relative to the launcher.
 * Prefers to open above (panel bottom = launcher top); falls back to below if not enough space.
 * Right-aligns panel with launcher. Result is always clamped to the viewport.
 */
export function computePanelOpenPosition(
  launcherPosition: FloatingPoint,
  launcherSize: FloatingSize,
  panelSize: FloatingSize,
  viewport: FloatingViewport,
  margin: number,
): FloatingPoint {
  const openAboveY = launcherPosition.y - panelSize.height
  const openBelowY = launcherPosition.y + launcherSize.height
  const y = openAboveY >= margin ? openAboveY : openBelowY
  // Right-align panel with launcher
  const x = launcherPosition.x + launcherSize.width - panelSize.width
  return clampFloatingPoint({ x, y }, panelSize, viewport, margin)
}

export function resolveDefaultPanelPosition(
  viewport: FloatingViewport,
  size: FloatingSize,
  margin: number,
): FloatingPoint {
  return clampFloatingPoint(
    {
      x: viewport.width - size.width - margin,
      y: Math.max(margin, Math.round(viewport.height * 0.08)),
    },
    size,
    viewport,
    margin,
  )
}

export function resolveDefaultLauncherPosition(
  viewport: FloatingViewport,
  size: FloatingSize,
  margin: number,
): FloatingPoint {
  return clampFloatingPoint(
    {
      x: viewport.width - size.width - margin,
      y: viewport.height - size.height - margin,
    },
    size,
    viewport,
    margin,
  )
}

export function readPersistedLayout(storageKey: string): Partial<PersistedAiPanelLayout> | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAiPanelLayout>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function writePersistedLayout(storageKey: string, layout: PersistedAiPanelLayout): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(layout))
}

// ---------------------------------------------------------------------------
// Thread persistence (separate key: storageKey + ":thread")
// ---------------------------------------------------------------------------

function threadKey(storageKey: string): string {
  return `${storageKey}:thread`
}

export function readPersistedThread(storageKey: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(threadKey(storageKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedAiPanelThread>
    return parsed?.threadId ?? null
  } catch {
    return null
  }
}

export function writePersistedThread(storageKey: string, threadId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(threadKey(storageKey), JSON.stringify({ threadId }))
}

export function clearPersistedThread(storageKey: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(threadKey(storageKey))
}
