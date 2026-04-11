import { useEffect, useMemo, useRef } from 'react'

import type { Costumer } from '@/features/costumer'
import { useCostumerQueries } from '@/features/costumer/controllers/costumerQueries.controller'
import { validateEmail } from '@shared-domain'

export const normalizeEmail = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ''

export const shouldLookupCostumerByEmail = ({
  enabled,
  mode,
  email,
  selectedCostumerEmail,
  lastResolvedEmail,
}: {
  enabled: boolean
  mode: 'create' | 'edit'
  email: string
  selectedCostumerEmail: string
  lastResolvedEmail: string
}) => {
  if (!enabled) return false
  if (mode !== 'create') return false
  if (!validateEmail(email)) return false
  if (email === selectedCostumerEmail) return false
  if (email === lastResolvedEmail) return false
  return true
}

export const resolveExactCostumerEmailMatch = ({
  candidates,
  normalizedEmail,
}: {
  candidates: Costumer[]
  normalizedEmail: string
}) => candidates.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail) ?? null

export const useOrderFormCostumerLookupFlow = ({
  enabled,
  mode,
  email,
  selectedCostumerEmail,
  onResolved,
  debounceMs = 300,
}: {
  enabled: boolean
  mode: 'create' | 'edit'
  email: string
  selectedCostumerEmail?: string | null
  onResolved: (costumer: Costumer) => void
  debounceMs?: number
}) => {
  const { queryCostumerByEmail } = useCostumerQueries()
  const requestTokenRef = useRef(0)
  const lastResolvedEmailRef = useRef('')
  const latestEmailRef = useRef('')

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email])
  const normalizedSelectedEmail = useMemo(
    () => normalizeEmail(selectedCostumerEmail),
    [selectedCostumerEmail],
  )

  useEffect(() => {
    latestEmailRef.current = normalizedEmail

    if (
      !shouldLookupCostumerByEmail({
        enabled,
        mode,
        email: normalizedEmail,
        selectedCostumerEmail: normalizedSelectedEmail,
        lastResolvedEmail: lastResolvedEmailRef.current,
      })
    ) {
      return
    }

    const timeoutId = window.setTimeout(async () => {
      const token = requestTokenRef.current + 1
      requestTokenRef.current = token

      const result = await queryCostumerByEmail(normalizedEmail)
      if (requestTokenRef.current !== token || latestEmailRef.current !== normalizedEmail || !result) {
        return
      }

      const exactEmailMatch = resolveExactCostumerEmailMatch({
        candidates: Object.values(result.byClientId),
        normalizedEmail,
      })
      if (!exactEmailMatch) {
        return
      }

      lastResolvedEmailRef.current = normalizedEmail
      onResolved(exactEmailMatch)
    }, debounceMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [debounceMs, enabled, mode, normalizedEmail, normalizedSelectedEmail, onResolved, queryCostumerByEmail])
}
