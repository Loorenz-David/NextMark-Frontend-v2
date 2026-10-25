import { useEffect } from 'react'

const LOCK_CLASS = 'document-scroll-locked'

/**
 * Locks the document while a screen built as one fixed frame is mounted: its
 * panels scroll on their own, so the document must never scroll or bounce.
 * Anything poking past the frame edge (a hit area, a menu opened in a portal)
 * would otherwise let a drag on static chrome scroll the whole page.
 */
export const useDocumentScrollLock = () => {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add(LOCK_CLASS)
    return () => root.classList.remove(LOCK_CLASS)
  }, [])
}
