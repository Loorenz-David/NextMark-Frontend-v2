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

export function SectionManagerHost({ stackKey, isBaseOpen, containerClassName, width }: SectionManagerHostProps) {
  const sectionManager = useSectionManager()
  const entries = useStackActionEntries(sectionManager)
  const openSections = entries.filter((entry) => !entry.isClosing)
  const sectionCount = openSections.length

  useEffect(()=>{
    const allowedOpenOnce = new Set(['orderCase.orderCases', 'orderCase.details'])

    const seen= new Map<string,Section>()
    const toClose: string[] = []

    for (const section of openSections){
      if(!allowedOpenOnce.has(section.key)) continue

      const existing = seen.get(section.key)
      if (existing){
        toClose.push( existing.id )
      }
      seen.set( section.key, section )
    }


    toClose.forEach((id) => {
      sectionManager.closeExactWithDelay(id, DUPLICATE_SECTION_CLOSE_DELAY_MS)
    })



  }, [openSections, sectionManager])

  


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
