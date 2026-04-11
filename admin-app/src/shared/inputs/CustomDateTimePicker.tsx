import { useEffect, useMemo, useRef, useState } from 'react'

import { CustomDatePicker } from './CustomDatePicker'
import { CustomTimePicker } from './CustomTimePicker/index'

type CustomDateTimePickerProps = {
  date?: Date | null
  onChangeDate?: (value: string | null) => void
  selectedTime?: string | null
  onChangeTime?: (value: string | null) => void
  disablePastDate?: boolean
  disablePastTime?: boolean
  className?: string
  dateSectionClassName?: string
  timeSectionClassName?: string
  datePickerClassName?: string
  timePickerClassName?: string
}

export const CustomDateTimePicker = ({
  date,
  onChangeDate,
  selectedTime,
  onChangeTime,
  disablePastDate = false,
  disablePastTime = false,
  className,
  dateSectionClassName,
  timeSectionClassName,
  datePickerClassName,
  timePickerClassName,
}: CustomDateTimePickerProps) => {
  const isTimeControlled = selectedTime !== undefined && Boolean(onChangeTime)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const interactionOrderRef = useRef<'none' | 'date-first' | 'time-first'>('none')
  const lastSelectedDateRef = useRef<string | null>(date ? formatDateOnly(date) : null)
  const suppressDateOpenUntilRef = useRef(0)

  const [internalTime, setInternalTime] = useState<string | null>(() =>
    deriveTimeFromDate(date),
  )

  const resolvedTime = useMemo(
    () => (isTimeControlled ? selectedTime ?? null : internalTime),
    [internalTime, isTimeControlled, selectedTime],
  )

  useEffect(() => {
    if (isTimeControlled) return
    setInternalTime(deriveTimeFromDate(date))
  }, [date, isTimeControlled])

  useEffect(() => {
    lastSelectedDateRef.current = date ? formatDateOnly(date) : null
  }, [date])

  useEffect(() => {
    if (!isDatePickerOpen && !isTimePickerOpen) {
      interactionOrderRef.current = 'none'
    }
  }, [isDatePickerOpen, isTimePickerOpen])

  const handleDateChange = (value: string | null) => {
    if (!value) {
      lastSelectedDateRef.current = null
      onChangeDate?.(null)
      return
    }

    lastSelectedDateRef.current = value

    const normalizedTime = normalizeTime(resolvedTime)
    if (!normalizedTime) {
      onChangeDate?.(value)
      return
    }

    const combined = new Date(`${value}T${normalizedTime}`)
    onChangeDate?.(Number.isNaN(combined.getTime()) ? value : combined.toISOString())
  }

  const handleTimeChange = (value: string | null) => {
    suppressDateOpenUntilRef.current = Date.now() + 250
    setIsDatePickerOpen(false)

    if (isTimeControlled) {
      onChangeTime?.(value)
    } else {
      setInternalTime(value)
    }

    const dateValue = date ? formatDateOnly(date) : lastSelectedDateRef.current
    if (!dateValue) return

    const normalized = normalizeTime(value)
    if (!normalized) {
      onChangeDate?.(dateValue)
      return
    }

    const combined = new Date(`${dateValue}T${normalized}`)
    onChangeDate?.(Number.isNaN(combined.getTime()) ? dateValue : combined.toISOString())
  }

  const isTimeDisabled = !date && !isTimePickerOpen

  const handleDatePickerOpenChange = (nextOpen: boolean) => {
    if (nextOpen && (isTimePickerOpen || Date.now() < suppressDateOpenUntilRef.current)) {
      return
    }

    setIsDatePickerOpen(nextOpen)

    if (!nextOpen) {
      return
    }

    setIsTimePickerOpen(false)
    if (interactionOrderRef.current === 'none') {
      interactionOrderRef.current = 'date-first'
    }
  }

  const handleTimePickerOpenChange = (nextOpen: boolean) => {
    setIsTimePickerOpen(nextOpen)

    if (!nextOpen) {
      suppressDateOpenUntilRef.current = Date.now() + 250
      return
    }

    setIsDatePickerOpen(false)
    if (interactionOrderRef.current === 'none') {
      interactionOrderRef.current = 'time-first'
    }
  }

  const handleDateCalendarSelect = () => {
    if (interactionOrderRef.current !== 'date-first') {
      return
    }

    setIsDatePickerOpen(false)
    setIsTimePickerOpen(true)
  }

  return (
    <div className={`custom-field-container custom-date-time-group flex items-center ${className ?? ''}`}
    style={{padding:'0'}}
    >
      <style>
        {`
          .custom-date-time-group .custom-field-container {
            border: none;
            background: transparent;
            box-shadow: none;
            padding: 0;
            border-radius: 0;
          }
          .custom-date-time-group .custom-field-container:focus-within {
            background: transparent;
            box-shadow: none;
          }
        `}
      </style>
      <div className={`flex-1 border-r-1 border-[var(--color-muted)]/30 ${dateSectionClassName ?? ''}`}>
        <CustomDatePicker
          date={date}
          onChange={handleDateChange}
          disablePast={disablePastDate}
          className={datePickerClassName}
          open={isDatePickerOpen}
          onOpenChange={handleDatePickerOpenChange}
          onCalendarSelect={handleDateCalendarSelect}
        />
      </div>

      <div
        className={`${isTimeDisabled ? 'flex-1 opacity-50 pointer-events-none' : 'flex-1'} ${timeSectionClassName ?? ''}`}
        onPointerDown={(event) => {
          if (isTimeDisabled) return
          suppressDateOpenUntilRef.current = Date.now() + 350
          event.stopPropagation()
        }}
        onMouseDown={(event) => {
          if (isTimeDisabled) return
          suppressDateOpenUntilRef.current = Date.now() + 350
          event.stopPropagation()
        }}
        onClick={() => {
          if (isTimeDisabled) return
          suppressDateOpenUntilRef.current = Date.now() + 350
          handleTimePickerOpenChange(true)
        }}
      >
        <CustomTimePicker
          selectedTime={resolvedTime}
          onChange={(value) => handleTimeChange(value || null)}
          disablePastForDate={disablePastTime ? (date ?? lastSelectedDateRef.current) : null}
          containerClassName={timePickerClassName}
          open={isTimePickerOpen}
          onOpenChange={handleTimePickerOpenChange}
        />
      </div>
    </div>
  )
}

const deriveTimeFromDate = (value?: Date | null) => {
  if (!value) return null
  if (Number.isNaN(value.getTime())) return null
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const normalizeTime = (value: string | null | undefined) => {
  if (!value) return null
  const [hours = '00', minutes = '00', seconds = '00'] = value.split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
}

const formatDateOnly = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
