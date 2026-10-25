/**
 * Visual drag cue shared by the touch and mouse sensors: `pressing` while a
 * press waits to become a drag, `active` once it is one. Styles live next to
 * `.dnd-touch-source` in `index.css`.
 */
export type DragCue = 'pressing' | 'active'

export const DRAG_CUE_ATTRIBUTE = 'data-drag-cue'

/** Delay before the pressing cue shows, so quick taps and clicks never flash it. */
export const PRESS_CUE_DELAY_MS = 80

export const setDragCue = (node: HTMLElement | null, cue: DragCue | null) => {
  if (!node) return
  if (cue) node.setAttribute(DRAG_CUE_ATTRIBUTE, cue)
  else node.removeAttribute(DRAG_CUE_ATTRIBUTE)
}
