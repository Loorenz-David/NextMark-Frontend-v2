/**
 * Keeps the document head in step with the route.
 *
 * One effect, one owner. The form feature does not touch `document.head` at all
 * — install metadata is an application concern, and scattering head writes
 * across a feature is how a tag ends up outliving the route that wrote it.
 */

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { resolvePwaHeadState } from './domain/externalFormPwa'
import { createManagedHead, type ManagedHead } from './domain/managedHead'
import { createDocumentHeadPort } from './infrastructure/documentHead.port'

export const useExternalFormPwaHead = () => {
  const { pathname } = useLocation()
  const headRef = useRef<ManagedHead | null>(null)

  if (headRef.current === null && typeof document !== 'undefined') {
    headRef.current = createManagedHead(createDocumentHeadPort())
  }

  useEffect(() => {
    const head = headRef.current
    if (!head) return

    head.apply(resolvePwaHeadState(pathname))
  }, [pathname])

  useEffect(
    () => () => {
      // Unmount is the last chance to hand the document back as it was found.
      headRef.current?.clear()
    },
    [],
  )
}
