import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@shared-domain'
import {
  isDateOnOrAfterToday,
  isDateTimeOnOrAfterNow,
  validateDateComparison,
  validateDateTimeComparison,
} from '@/shared/data-validation/timeValidation'

type PlanDatePayload = { start_date: string; end_date: string }

type RouteTimePayload = {
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
}

export const useLocalDeliveryEditFormWarnings = () => {
  const planDateWarning = useInputWarning(
    'Plan must have a start and end date',
    ({ start_date, end_date }: PlanDatePayload, setWarningMessage) => {
      if (!validateString(start_date)) {
        setWarningMessage('Plan must have a start date')
        return false
      }
      if (!validateString(end_date)) {
        setWarningMessage('Plan must have an end date')
        return false
      }
      if (!isDateOnOrAfterToday(start_date)) {
        setWarningMessage('Plan start date cannot be in the past')
        return false
      }
      if (!isDateOnOrAfterToday(end_date)) {
        setWarningMessage('Plan end date cannot be in the past')
        return false
      }
      if (!validateDateComparison(start_date, end_date)) {
        setWarningMessage("'Start' date must be before 'End' date")
        return false
      }
      return true
    },
  )

  const routeStartTimeWarning = useInputWarning(
    'Start time cannot be in the past for today',
    ({ start_date, start_time }: Pick<RouteTimePayload, 'start_date' | 'start_time'>, setWarningMessage) => {
      if (!isDateTimeOnOrAfterNow(start_date, start_time)) {
        setWarningMessage('Start time cannot be in the past for today')
        return false
      }
      return true
    },
  )

  const routeEndTimeWarning = useInputWarning(
    'End time must be after start time',
    ({ start_date, end_date, start_time, end_time }: RouteTimePayload, setWarningMessage) => {
      if (!isDateTimeOnOrAfterNow(end_date, end_time)) {
        setWarningMessage('End time cannot be in the past for today')
        return false
      }
      const isValid = validateDateTimeComparison(start_date, start_time, end_date, end_time)
      if (!isValid) {
        setWarningMessage('End time must be after start time')
        return false
      }
      return true
    },
  )

  const vehicleBusyWarning = useInputWarning('Vehicle is unavailable during the selected dates.')

  return {
    planDateWarning,
    routeStartTimeWarning,
    routeEndTimeWarning,
    vehicleBusyWarning,
  }
}
