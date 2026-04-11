import { useEffect, useMemo } from 'react'

import {
  HOURS_12,
  HOURS_24,
  PERIODS,
  type Period,
  type PickerFormat,
} from './types'
import { minuteValuesByStep, normalizeTimeValue } from './utils/timeClamp'
import { formatHHmm, parseHHmm, to12HourParts, to2 } from './utils/timeFormat'
import { useTimePickerState } from './hooks/useTimePickerState'
import { useSegmentedTimeInput } from './hooks/input/useSegmentedTimeInput'
import { TimeInputField } from './components/TimeInputField'
import { TimePickerPopover } from './components/TimePickerPopover'
import { TimeColumn } from './components/TimeColumn'
import { PickerFooter } from './components/PickerFooter'
import {
  isTimeValueAllowedByConstraint,
  resolveCurrentTeamTimeValue,
  resolveTimePastConstraint,
} from './utils/timePastConstraint'
import type { TimeValue } from './types'

type CustomTimePickerProps = {
  selectedTime: string | null | undefined
  onChange: (value: string) => void
  format?: PickerFormat
  disabled?: boolean
  minuteStep?: number
  className?: string
  containerClassName?: string
  popoverWidth?: number
  popoverHeight?: number
  closeOnDone?: boolean
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  disablePastForDate?: Date | string | null
}

export const CustomTimePicker = ({
  selectedTime,
  onChange,
  format = '24h',
  disabled = false,
  minuteStep = 1,
  className,
  containerClassName,
  popoverWidth = 320,
  popoverHeight = 260,
  closeOnDone = true,
  open,
  onOpenChange,
  disablePastForDate,
}: CustomTimePickerProps) => {
  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    if (!selectedTime) {
      return
    }

    if (!parseHHmm(selectedTime)) {
      // eslint-disable-next-line no-console
      console.warn('CustomTimePicker received invalid time', selectedTime)
    }
  }, [selectedTime])

  const {
    open: internalOpen,
    setOpen: setInternalOpen,
    draft,
    setDraft,
    beginInteraction,
    cancel,
    done,
  } = useTimePickerState({
    selectedTime,
    minuteStep,
    closeOnDone,
  })
  const isOpenControlled = open !== undefined
  const resolvedOpen = isOpenControlled ? Boolean(open) : internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (!isOpenControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const minuteValues = useMemo(() => minuteValuesByStep(minuteStep), [minuteStep])
  const draft12 = useMemo(() => to12HourParts(draft), [draft])
  const pastConstraint = useMemo(
    () => resolveTimePastConstraint({ comparisonDate: disablePastForDate, minuteStep }),
    [disablePastForDate, minuteStep],
  )

  const isDraftAllowed = useMemo(
    () => isTimeValueAllowedByConstraint(draft, pastConstraint),
    [draft, pastConstraint],
  )

  const minimumAllowedTime = useMemo(
    () => resolveCurrentTeamTimeValue(minuteStep),
    [minuteStep],
  )

  useEffect(() => {
    if (!resolvedOpen) {
      return
    }

    if (pastConstraint.mode === 'none' || isDraftAllowed) {
      return
    }

    setDraft(minimumAllowedTime)
  }, [isDraftAllowed, minimumAllowedTime, pastConstraint.mode, resolvedOpen, setDraft])

  const applyDraftUpdate = (updater: (current: TimeValue) => TimeValue) => {
    const nextDraft = normalizeTimeValue(updater(draft), minuteStep)
    if (!isTimeValueAllowedByConstraint(nextDraft, pastConstraint)) {
      return
    }
    setDraft(nextDraft)
  }

  const setGuardedDraftHour = (hour: number) => {
    applyDraftUpdate((current) => ({ ...current, hour }))
  }

  const setGuardedDraftMinute = (minute: number) => {
    applyDraftUpdate((current) => ({ ...current, minute }))
  }

  const setGuardedDraftPeriod = (nextPeriod: Period) => {
    applyDraftUpdate((current) => {
      const as12 = to12HourParts(current)
      const baseHour = nextPeriod === 'PM' ? (as12.hour % 12) + 12 : as12.hour % 12
      return {
        hour: baseHour,
        minute: current.minute,
      }
    })
  }

  const segmentedInput = useSegmentedTimeInput({
    format,
    minuteStep,
    value: draft,
    onChangeHour24: setGuardedDraftHour,
    onChangeMinute: setGuardedDraftMinute,
    onChangePeriod: setGuardedDraftPeriod,
    onCancel: cancel,
    onDone: () => {
      if (!isDraftAllowed) {
        return
      }
      const normalized = done()
      onChange(normalized || '')
    },
  })

  const closeWithCancel = (nextOpen: boolean) => {
    if (disabled) {
      return
    }

    if (nextOpen) {
      beginInteraction()
      setOpen(true)
      return
    }

    cancel()
    setOpen(false)
  }

  const handleDone = () => {
    if (!isDraftAllowed) {
      return
    }
    const normalized = done()
    onChange(normalized || '')
    if (!closeOnDone) {
      setOpen(true)
      return
    }
    setOpen(false)
  }

  const handleCancel = () => {
    cancel()
    setOpen(false)
  }

  const handleNow = () => {
    if (pastConstraint.mode === 'disabled-all') {
      return
    }

    const nextMinute = new Date()
    nextMinute.setMinutes(nextMinute.getMinutes() + 1)

    const normalized = resolveCurrentTeamTimeValue(
      minuteStep,
      nextMinute,
    )

    setDraft(normalized)

    onChange(formatHHmm(normalized))

    if (closeOnDone) {
      setOpen(false)
    }
  }

  const inputReference = (
    <TimeInputField
      value={segmentedInput.displayValue}
      disabled={disabled}
      className={containerClassName ?? className}
      onOpen={() => {
        if (!resolvedOpen) {
          beginInteraction()
        }
        setOpen(true)
      }}
      onFocus={(input) => segmentedInput.onFocus(input)}
      onClick={(input, caret) => segmentedInput.onClick(input, caret)}
      onKeyDown={segmentedInput.onKeyDown}
    />
  )

  return (
    <TimePickerPopover
      open={resolvedOpen}
      onOpenChange={closeWithCancel}
      reference={inputReference}
      width={popoverWidth}
      height={popoverHeight}
    >
      <div className="flex flex-col gap-3 p-3">
        <div className={`grid gap-2 ${format === '12h' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TimeColumn
            label="Hours"
            values={format === '12h' ? HOURS_12 : HOURS_24}
            value={format === '12h' ? draft12.hour : draft.hour}
            isValueDisabled={(nextHour) => {
              const candidateHour = format === '12h'
                ? (draft12.period === 'PM' ? (nextHour % 12) + 12 : nextHour % 12)
                : nextHour

              return !isTimeValueAllowedByConstraint(
                { hour: candidateHour, minute: draft.minute },
                pastConstraint,
              )
            }}
            onChange={(nextHour) => {
              if (format === '12h') {
                const hour24 = draft12.period === 'PM' ? (nextHour % 12) + 12 : nextHour % 12
                setGuardedDraftHour(hour24)
                return
              }
              setGuardedDraftHour(nextHour)
            }}
            formatter={(entry) => to2(entry)}
          />

          <TimeColumn
            label="Minutes"
            values={minuteValues}
            value={draft.minute}
            isValueDisabled={(nextMinute) =>
              !isTimeValueAllowedByConstraint(
                { hour: draft.hour, minute: nextMinute },
                pastConstraint,
              )
            }
            onChange={(nextMinute) => setGuardedDraftMinute(nextMinute)}
            formatter={(entry) => to2(entry)}
          />

          {format === '12h' ? (
            <TimeColumn
              label="Period"
              values={[0, 1]}
              value={draft12.period === 'AM' ? 0 : 1}
              isValueDisabled={(next) => {
                const nextPeriod = next === 0 ? 'AM' : 'PM'
                const candidateHour = nextPeriod === 'PM'
                  ? (draft12.hour % 12) + 12
                  : draft12.hour % 12

                return !isTimeValueAllowedByConstraint(
                  { hour: candidateHour, minute: draft.minute },
                  pastConstraint,
                )
              }}
              onChange={(next) => setGuardedDraftPeriod(next === 0 ? 'AM' : 'PM')}
              formatter={(entry) => PERIODS[entry] as Period}
            />
          ) : null}
        </div>
      </div>

      <PickerFooter onNow={handleNow} onCancel={handleCancel} onDone={handleDone} />
    </TimePickerPopover>
  )
}
