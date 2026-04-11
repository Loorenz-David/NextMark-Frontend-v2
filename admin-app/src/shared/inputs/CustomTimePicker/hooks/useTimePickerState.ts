import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Period, TimeValue } from '../types'
import { DEFAULT_TIME_VALUE } from '../types'
import { normalizeTimeValue } from '../utils/timeClamp'
import { formatHHmm, parseHHmm, to12HourParts, to24HourValue } from '../utils/timeFormat'

type UseTimePickerStateParams = {
  selectedTime: string | null | undefined
  minuteStep: number
  closeOnDone: boolean
}

export const useTimePickerState = ({
  selectedTime,
  minuteStep,
  closeOnDone,
}: UseTimePickerStateParams) => {
  const parsedSelected = useMemo(() => parseHHmm(selectedTime), [selectedTime])
  const committed = useMemo(
    () => normalizeTimeValue(parsedSelected ?? DEFAULT_TIME_VALUE, minuteStep),
    [minuteStep, parsedSelected],
  )

  const committedRef = useRef(committed)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<TimeValue>(committed)
  const initialDraftOnOpenRef = useRef<TimeValue>(committed)

  useEffect(() => {
    committedRef.current = committed
    if (!open) {
      setDraft(committed)
      initialDraftOnOpenRef.current = committed
    }
  }, [committed, open])

  const beginInteraction = useCallback(() => {
    if (!open) {
      initialDraftOnOpenRef.current = draft
      setOpen(true)
    }
  }, [draft, open])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const cancel = useCallback(() => {
    setDraft(initialDraftOnOpenRef.current)
    setOpen(false)
  }, [])

  const done = useCallback(() => {
    const normalized = normalizeTimeValue(draft, minuteStep)
    setDraft(normalized)
    if (closeOnDone) {
      setOpen(false)
    }
    return formatHHmm(normalized)
  }, [closeOnDone, draft, minuteStep])

  const setDraftHour = useCallback(
    (hour: number) => {
      setDraft((previous) => normalizeTimeValue({ ...previous, hour }, minuteStep))
    },
    [minuteStep],
  )

  const setDraftMinute = useCallback(
    (minute: number) => {
      setDraft((previous) => normalizeTimeValue({ ...previous, minute }, minuteStep))
    },
    [minuteStep],
  )

  const setDraftPeriod = useCallback((period: Period) => {
    setDraft((previous) => {
      const as12 = to12HourParts(previous)
      return to24HourValue(as12.hour, as12.minute, period)
    })
  }, [])

  return {
    open,
    setOpen,
    close,
    committed,
    draft,
    setDraft,
    setDraftHour,
    setDraftMinute,
    setDraftPeriod,
    beginInteraction,
    cancel,
    done,
  }
}
