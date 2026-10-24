// TEMPORARY dev-only diagnostics for touch drag-and-drop (iPad refactor).
// On by default in dev while the touch drag issue is investigated; `?dndDebug=0`
// turns it off (remembered), `?dndDebug=1` back on. Remove once understood.

type DebugEntry = Record<string, unknown> & { t: number; kind: string }

type DndDebugApi = {
  log: DebugEntry[]
  push: (kind: string, data?: Record<string, unknown>) => void
  dump: () => string
  clear: () => void
}

declare global {
  interface Window {
    __dndDebug?: DndDebugApi
  }
}

const STORAGE_KEY = 'nextmark.dndDebug'

export const isDndDebugRequested = (): boolean => {
  try {
    const param = new URLSearchParams(window.location.search).get('dndDebug')
    if (param === '1') window.localStorage.removeItem(STORAGE_KEY)
    if (param === '0') window.localStorage.setItem(STORAGE_KEY, 'off')
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return false
  }
}

const describe = (node: EventTarget | null): string => {
  if (!(node instanceof Element)) return String(node && (node as Node).nodeName)
  const id = node.id ? `#${node.id}` : ''
  const classes =
    typeof node.className === 'string' && node.className
      ? `.${node.className.trim().split(/\s+/).slice(0, 4).join('.')}`
      : ''
  return `${node.tagName.toLowerCase()}${id}${classes}`
}

const touchActionChain = (node: EventTarget | null): string[] => {
  const chain: string[] = []
  let el = node instanceof Element ? node : null
  for (let depth = 0; el && depth < 12; depth += 1, el = el.parentElement) {
    const value = getComputedStyle(el).touchAction
    if (value && value !== 'auto') chain.push(`${describe(el)} → ${value}`)
  }
  return chain
}

const draggableInfo = (node: EventTarget | null) => {
  const el = node instanceof Element ? node : null
  const draggable = el?.closest('[aria-roledescription]')
  return {
    draggable: draggable ? describe(draggable) : null,
    roledescription: draggable?.getAttribute('aria-roledescription') ?? null,
    touchSource: el?.closest('.dnd-touch-source') ? describe(el.closest('.dnd-touch-source')) : null,
  }
}

export const installDndTouchDebug = () => {
  if (window.__dndDebug) return

  let gestureStart = 0
  let moveCount = 0
  let scrollLogged = new Set<EventTarget>()

  const api: DndDebugApi = {
    log: [],
    push(kind, data = {}) {
      const entry: DebugEntry = {
        t: gestureStart ? Math.round(performance.now() - gestureStart) : 0,
        kind,
        ...data,
      }
      api.log.push(entry)
      if (api.log.length > 400) api.log.shift()
      const { t, kind: _kind, ...rest } = entry
      void _kind
      console.log(`[dnd-debug] +${t}ms ${kind} ${JSON.stringify(rest)}`)
    },
    dump: () => JSON.stringify(api.log, null, 1),
    clear: () => {
      api.log.length = 0
    },
  }
  window.__dndDebug = api

  const media = (query: string) => window.matchMedia(query).matches
  api.push('environment', {
    width: window.innerWidth,
    height: window.innerHeight,
    pointerCoarse: media('(pointer: coarse)'),
    pointerFine: media('(pointer: fine)'),
    anyPointerFine: media('(any-pointer: fine)'),
    hoverNone: media('(hover: none)'),
    maxTouchPoints: navigator.maxTouchPoints,
    hasOntouchstart: 'ontouchstart' in window,
    hasTouchEvent: typeof window.TouchEvent === 'function',
    userAgent: navigator.userAgent,
  })

  // Capture phase: we see the event before any app handler.
  window.addEventListener(
    'touchstart',
    (event) => {
      gestureStart = performance.now()
      moveCount = 0
      scrollLogged = new Set()
      const first = event.touches[0]
      api.push('touchstart', {
        x: first ? Math.round(first.clientX) : null,
        y: first ? Math.round(first.clientY) : null,
        target: describe(event.target),
        touches: event.touches.length,
        cancelable: event.cancelable,
        ...draggableInfo(event.target),
        touchAction: touchActionChain(event.target),
      })
    },
    { capture: true, passive: true },
  )

  // Bubble phase on window: runs after the app's own listeners, so
  // defaultPrevented tells whether dnd-kit claimed the gesture.
  window.addEventListener(
    'touchmove',
    (event) => {
      moveCount += 1
      if (moveCount <= 5 || moveCount % 10 === 0) {
        const touch = event.touches[0]
        api.push('touchmove', {
          n: moveCount,
          x: touch ? Math.round(touch.clientX) : null,
          y: touch ? Math.round(touch.clientY) : null,
          cancelable: event.cancelable,
          defaultPrevented: event.defaultPrevented,
        })
      }
    },
    { passive: true },
  )

  for (const type of ['touchend', 'touchcancel'] as const) {
    window.addEventListener(
      type,
      (event) => {
        api.push(type, { moves: moveCount, cancelable: event.cancelable, target: describe(event.target) })
      },
      { capture: true, passive: true },
    )
  }

  for (const type of ['pointerdown', 'pointercancel', 'pointerup'] as const) {
    window.addEventListener(
      type,
      (event) => {
        api.push(type, { pointerType: event.pointerType, target: describe(event.target) })
      },
      { capture: true, passive: true },
    )
  }

  for (const type of ['mousedown', 'contextmenu', 'selectstart', 'dragstart'] as const) {
    window.addEventListener(
      type,
      (event) => {
        api.push(type, { target: describe(event.target), defaultPrevented: event.defaultPrevented })
      },
      { capture: false },
    )
  }

  document.addEventListener(
    'scroll',
    (event) => {
      if (!gestureStart || scrollLogged.has(event.target as EventTarget)) return
      scrollLogged.add(event.target as EventTarget)
      const el = event.target instanceof Element ? event.target : null
      api.push('scroll', { target: describe(event.target), scrollTop: el?.scrollTop ?? null })
    },
    { capture: true, passive: true },
  )

  console.info(
    '[dnd-debug] installed (dev only; ?dndDebug=0 turns it off). Copy the [dnd-debug] lines, or run copy(__dndDebug.dump()) to copy them all. __dndDebug.clear() resets.',
  )
}
