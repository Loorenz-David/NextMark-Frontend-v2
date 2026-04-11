import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import type { Period, PickerFormat, TimeSegment, TimeValue } from '../../types'
import { clampHour12, clampHour24, normalizeMinuteByStep } from '../../utils/timeClamp'
import { formatDisplayTime, to12HourParts } from '../../utils/timeFormat'

type UseSegmentedTimeInputParams = {
  format: PickerFormat
  minuteStep: number
  value: TimeValue
  onChangeHour24: (hour: number) => void
  onChangeMinute: (minute: number) => void
  onChangePeriod: (period: Period) => void
  onCancel: () => void
  onDone: () => void
}

const segmentOrderForFormat = (format: PickerFormat): TimeSegment[] =>
  format === '12h' ? ['hour', 'minute', 'period'] : ['hour', 'minute']

const getSelectionRange = (
  format: PickerFormat,
  segment: TimeSegment,
): [number, number] => {
  if (segment === 'hour') return [0, 2]
  if (segment === 'minute') return [3, 5]
  if (format === '12h') return [6, 8]
  return [3, 5]
}

export const useSegmentedTimeInput = ({
  format,
  minuteStep,
  value,
  onChangeHour24,
  onChangeMinute,
  onChangePeriod,
  onCancel,
  onDone,
}: UseSegmentedTimeInputParams) => {
  const [activeSegment, setActiveSegment] = useState<TimeSegment>('hour')
  const hourBufferRef = useRef('')
  const minuteBufferRef = useRef('')

  const displayValue = useMemo(() => formatDisplayTime(value, format), [format, value])
  const segmentOrder = useMemo(() => segmentOrderForFormat(format), [format])

  const selectSegment = useCallback(
    (input: HTMLInputElement | null, segment: TimeSegment) => {
      if (!input) {
        return
      }
      const [start, end] = getSelectionRange(format, segment)
      window.requestAnimationFrame(() => {
        input.setSelectionRange(start, end)
      })
    },
    [format],
  )

  const moveSegment = useCallback(
    (input: HTMLInputElement | null, direction: 1 | -1) => {
      const currentIndex = segmentOrder.indexOf(activeSegment)
      const nextIndex = Math.max(0, Math.min(segmentOrder.length - 1, currentIndex + direction))
      const nextSegment = segmentOrder[nextIndex]
      setActiveSegment(nextSegment)
      selectSegment(input, nextSegment)
    },
    [activeSegment, segmentOrder, selectSegment],
  )

  const applyHourDigit = useCallback(
    (digit: string, input: HTMLInputElement | null) => {
      if (!/^\d$/.test(digit)) {
        return
      }

      hourBufferRef.current = `${hourBufferRef.current}${digit}`.slice(-2)
      const parsed = Number(hourBufferRef.current)
      if (!Number.isFinite(parsed)) {
        return
      }

      if (format === '24h') {
        const nextHour = clampHour24(parsed)
        onChangeHour24(nextHour)
      } else {
        const as12 = to12HourParts(value)
        const next12h = clampHour12(parsed || 1)
        const nextPeriod = as12.period
        onChangePeriod(nextPeriod)
        if (nextPeriod === 'AM') {
          onChangeHour24(next12h % 12)
        } else {
          onChangeHour24((next12h % 12) + 12)
        }
      }

      if (hourBufferRef.current.length >= 2) {
        setActiveSegment('minute')
        selectSegment(input, 'minute')
      }
    },
    [format, onChangeHour24, onChangePeriod, selectSegment, value],
  )

  const applyMinuteDigit = useCallback(
    (digit: string) => {
      if (!/^\d$/.test(digit)) {
        return
      }

      minuteBufferRef.current = `${minuteBufferRef.current}${digit}`.slice(-2)
      const parsed = Number(minuteBufferRef.current)
      if (!Number.isFinite(parsed)) {
        return
      }

      onChangeMinute(normalizeMinuteByStep(parsed, minuteStep))
    },
    [minuteStep, onChangeMinute],
  )

  const incrementSegment = useCallback(
    (direction: 1 | -1) => {
      if (activeSegment === 'hour') {
        if (format === '24h') {
          onChangeHour24(clampHour24(value.hour + direction))
          return
        }

        const as12 = to12HourParts(value)
        const next12 = clampHour12(as12.hour + direction)
        if (as12.period === 'AM') {
          onChangeHour24(next12 % 12)
        } else {
          onChangeHour24((next12 % 12) + 12)
        }
        return
      }

      if (activeSegment === 'minute') {
        onChangeMinute(normalizeMinuteByStep(value.minute + direction * minuteStep, minuteStep))
        return
      }

      const as12 = to12HourParts(value)
      onChangePeriod(as12.period === 'AM' ? 'PM' : 'AM')
    },
    [activeSegment, format, minuteStep, onChangeHour24, onChangeMinute, onChangePeriod, value],
  )

  const onFocus = useCallback((input: HTMLInputElement | null) => {
    setActiveSegment('hour')
    hourBufferRef.current = ''
    minuteBufferRef.current = ''
    selectSegment(input, 'hour')
  }, [selectSegment])

  const onClick = useCallback(
    (input: HTMLInputElement | null, caret: number | null | undefined) => {
      const position = caret ?? 0
      if (position <= 2) {
        setActiveSegment('hour')
        selectSegment(input, 'hour')
        return
      }
      if (position <= 5) {
        setActiveSegment('minute')
        selectSegment(input, 'minute')
        return
      }
      if (format === '12h') {
        setActiveSegment('period')
        selectSegment(input, 'period')
      }
    },
    [format, selectSegment],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const input = event.currentTarget

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveSegment(input, 1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveSegment(input, -1)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        incrementSegment(1)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        incrementSegment(-1)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        onDone()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        if (activeSegment === 'minute' && minuteBufferRef.current.length === 0) {
          setActiveSegment('hour')
          selectSegment(input, 'hour')
          return
        }

        if (activeSegment === 'minute') {
          minuteBufferRef.current = minuteBufferRef.current.slice(0, -1)
          return
        }

        if (activeSegment === 'hour') {
          hourBufferRef.current = hourBufferRef.current.slice(0, -1)
        }
        return
      }

      const upper = event.key.toUpperCase()
      if (activeSegment === 'period' && format === '12h') {
        if (upper === 'A') {
          event.preventDefault()
          onChangePeriod('AM')
          return
        }
        if (upper === 'P') {
          event.preventDefault()
          onChangePeriod('PM')
          return
        }
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        if (activeSegment === 'hour') {
          applyHourDigit(event.key, input)
          return
        }

        if (activeSegment === 'minute') {
          applyMinuteDigit(event.key)
        }
      }
    },
    [
      activeSegment,
      applyHourDigit,
      applyMinuteDigit,
      format,
      incrementSegment,
      moveSegment,
      onCancel,
      onChangePeriod,
      onDone,
      selectSegment,
    ],
  )

  return {
    activeSegment,
    displayValue,
    onFocus,
    onClick,
    onKeyDown,
    selectSegment,
  }
}
