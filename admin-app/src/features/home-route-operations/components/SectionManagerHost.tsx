import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'

interface SectionManagerHostProps {
  stackKey: string
  isBaseOpen: boolean
  containerClassName?: string
  width?:number
}

type Section ={
  key:string,
  id:string
  isClosing:boolean
}

// Must be >= B's spring settle time (~270ms for stiffness:300 damping:30)
// so A is removed only after B fully covers it. A's exit is then instant and invisible.
const DUPLICATE_SECTION_CLOSE_DELAY_MS = 350
const STALE_CLOSING_ENTRY_WARN_MS = 1500
const SINGLE_INSTANCE_SECTION_KEYS = new Set([
  'order.details',
  'costumer.details',
  'orderCase.orderCases',
  'orderCase.details',
])
const DEV = import.meta.env.DEV

export function SectionManagerHost({ stackKey, isBaseOpen, containerClassName, width }: SectionManagerHostProps) {
  const sectionManager = useSectionManager()
  const entries = useStackActionEntries(sectionManager)
  const openSections = entries.filter((entry) => !entry.isClosing)
  const sectionCount = openSections.length

  useEffect(()=>{
    const seen= new Map<string,Section>()
    const toClose: string[] = []

    for (const section of openSections){
      if(!SINGLE_INSTANCE_SECTION_KEYS.has(section.key)) continue

      const existing = seen.get(section.key)
      if (existing){
        toClose.push( existing.id )
      }
      seen.set( section.key, section )
    }


    toClose.forEach((id) => {
      sectionManager.closeExactWithDelay(id, DUPLICATE_SECTION_CLOSE_DELAY_MS)
    })

    if (!DEV || toClose.length === 0) {
      return
    }

    console.warn('[section-host] duplicate singleton sections detected', {
      stackKey,
      duplicateEntryIds: toClose,
      openSections: openSections.map((section) => ({
        id: section.id,
        key: section.key,
        isClosing: section.isClosing,
      })),
    })



  }, [openSections, sectionManager, stackKey])

  useEffect(() => {
    if (!DEV) {
      return
    }

    const duplicateKeys = Array.from(
      openSections.reduce((acc, entry) => {
        const nextCount = (acc.get(entry.key) ?? 0) + 1
        acc.set(entry.key, nextCount)
        return acc
      }, new Map<string, number>()),
    )
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count }))

    console.debug('[section-host] stack snapshot', {
      stackKey,
      isBaseOpen,
      totalEntries: entries.length,
      openEntries: openSections.length,
      closingEntries: entries.length - openSections.length,
      duplicateKeys,
      keys: entries.map((entry) => `${entry.key}:${entry.isClosing ? 'closing' : 'open'}`),
    })
  }, [entries, isBaseOpen, openSections, stackKey])

  useEffect(() => {
    if (!DEV) {
      return
    }

    const closingEntries = entries.filter((entry) => entry.isClosing)
    if (closingEntries.length === 0) {
      return
    }

    const timeoutIds = closingEntries.map((entry) =>
      window.setTimeout(() => {
        const currentEntry = sectionManager
          .getSnapshot()
          .find((candidate) => candidate.id === entry.id)
        if (currentEntry?.isClosing) {
          console.warn('[section-host] stale closing section entry', {
            stackKey,
            entryId: entry.id,
            key: entry.key,
            lingerMs: STALE_CLOSING_ENTRY_WARN_MS,
            currentEntries: sectionManager.getSnapshot().map((candidate) => ({
              id: candidate.id,
              key: candidate.key,
              isClosing: candidate.isClosing,
            })),
          })
        }
      }, STALE_CLOSING_ENTRY_WARN_MS),
    )

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [entries, sectionManager, stackKey])

  


  const stack = (
    <AnimatePresence mode="sync">
      {sectionManager.renderStack({variant:stackKey, width})}
    </AnimatePresence>
  )

  if (!containerClassName) {
    return stack
  }

  return (
    <div className={`${containerClassName} ${sectionCount > 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {stack}
    </div>
  )
}
