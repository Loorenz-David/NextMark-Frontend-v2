import { useCallback, useEffect, useRef } from 'react'
import type { ClientFormData, ClientFormStep } from '@client-form-kit'

import { emitExternalFormProgress } from '@/realtime/externalForm/externalForm.realtime'

import { toExternalFormData } from '../domain/externalForm.map'

const EXTERNAL_FORM_PROGRESS_THROTTLE_MS = 400

/**
 * Streams the customer's in-progress answers to the team room while a form
 * session is active.
 *
 * Leading + trailing throttle: the first change in a quiet window emits
 * immediately (so Device A sees the fill start without delay), later changes
 * coalesce into one trailing frame carrying the latest snapshot. Frames are
 * full snapshots, so a lost frame is replaced by the next one — no delivery
 * guarantee is needed.
 *
 * Each activation is one fill session: a fresh random `session` id with `seq`
 * restarting from 1. The receiver orders frames by `seq` within a session and
 * treats any new session as a replacement, which is what makes Device B's
 * per-request provider remount safe.
 *
 * Progress is best-effort — an emit failure must never break the customer's
 * form, so the emit is swallowed rather than surfaced.
 */
export const useExternalFormLiveProgressEmitter = ({
  active,
}: {
  active: boolean
}) => {
  const activeRef = useRef(active)
  const sessionRef = useRef('')
  const seqRef = useRef(0)
  const latestRef = useRef<{ data: ClientFormData; step: ClientFormStep } | null>(null)
  const timerRef = useRef<number | null>(null)
  const lastEmitAtRef = useRef(0)

  const flush = useCallback(() => {
    timerRef.current = null

    // The session may have ended while the trailing timer was pending — a
    // frame emitted now would resurrect a "filling" state after submit.
    const latest = latestRef.current
    if (!activeRef.current || !latest) {
      return
    }

    seqRef.current += 1
    lastEmitAtRef.current = Date.now()

    try {
      emitExternalFormProgress({
        progress_data: {
          form_data: toExternalFormData(latest.data),
          step: latest.step,
          seq: seqRef.current,
          session: sessionRef.current,
        },
      })
    } catch {
      // Best-effort: the next snapshot supersedes this one anyway.
    }
  }, [])

  const handleStateChange = useCallback(
    (data: ClientFormData, step: ClientFormStep) => {
      if (!activeRef.current) {
        return
      }

      latestRef.current = { data, step }

      const elapsed = Date.now() - lastEmitAtRef.current
      if (elapsed >= EXTERNAL_FORM_PROGRESS_THROTTLE_MS) {
        flush()
        return
      }

      if (timerRef.current === null) {
        timerRef.current = window.setTimeout(
          flush,
          EXTERNAL_FORM_PROGRESS_THROTTLE_MS - elapsed,
        )
      }
    },
    [flush],
  )

  useEffect(() => {
    activeRef.current = active

    if (active) {
      // New fill session: fresh identity, ordered from zero.
      sessionRef.current = crypto.randomUUID()
      seqRef.current = 0
      lastEmitAtRef.current = 0
      latestRef.current = null
      return
    }

    // Session ended — drop any pending trailing frame.
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    latestRef.current = null
  }, [active])

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    },
    [],
  )

  return { handleStateChange }
}
