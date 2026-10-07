/**
 * Runtime registry of open bottom sheets.
 *
 * Sheets are owned by whoever renders them (a card menu, a header button), so
 * nothing central knows they exist. The phone shell still has to treat an
 * open sheet as a navigation layer: the hardware back button must close it
 * before anything underneath. Every `BottomSheet` registers itself here while
 * open; the shell subscribes and closes the most recent one on back.
 */
type BottomSheetEntry = {
  id: string
  close: () => void
}

let entries: BottomSheetEntry[] = []
const listeners = new Set<() => void>()

const notify = () => {
  listeners.forEach((listener) => listener())
}

export const bottomSheetRegistry = {
  register(id: string, close: () => void): void {
    entries = [...entries.filter((entry) => entry.id !== id), { id, close }]
    notify()
  },
  unregister(id: string): void {
    if (!entries.some((entry) => entry.id === id)) return
    entries = entries.filter((entry) => entry.id !== id)
    notify()
  },
  getSnapshot(): readonly BottomSheetEntry[] {
    return entries
  },
  getOpenCount(): number {
    return entries.length
  },
  closeTop(): boolean {
    const top = entries.at(-1)
    if (!top) return false
    top.close()
    return true
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
