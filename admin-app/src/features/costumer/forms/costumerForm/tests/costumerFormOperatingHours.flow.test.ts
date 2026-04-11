import {
  hasOperatingHoursChanged,
  setOperatingHoursClosedState,
  toggleOperatingHoursDay,
  validateOperatingHours,
} from '../flows/costumerOperatingHours.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormOperatingHoursFlowTests = () => {
  const empty: Array<{
    weekday: number
    open_time?: string | null
    close_time?: string | null
    is_closed?: boolean
  }> = []

  const withMonday = toggleOperatingHoursDay({
    entries: empty,
    weekday: 0,
  })
  assert(withMonday.length === 1, 'selecting day should add an operating-hours entry')
  assert(
    withMonday[0]?.open_time === '09:00' && withMonday[0]?.close_time === '17:00',
    'selected day should use default opening time',
  )

  const removedMonday = toggleOperatingHoursDay({
    entries: withMonday,
    weekday: 0,
  })
  assert(removedMonday.length === 0, 'clicking selected day again should unselect/remove it')

  const closedMonday = setOperatingHoursClosedState({
    entries: withMonday,
    weekday: 0,
    isClosed: true,
  })
  assert(closedMonday[0]?.is_closed === true, 'closed toggle should mark day as closed')
  assert(validateOperatingHours(closedMonday).valid, 'closed day should be valid without open/close times')

  const invalidWindow = [{ weekday: 2, open_time: '18:00', close_time: '09:00', is_closed: false }]
  assert(!validateOperatingHours(invalidWindow).valid, 'open time should be earlier than close time')

  const unchanged = hasOperatingHoursChanged({
    current: [{ weekday: 0, open_time: '09:00', close_time: '17:00', is_closed: false }],
    initial: [{ weekday: 0, open_time: '09:00', close_time: '17:00', is_closed: false }],
  })
  assert(!unchanged, 'same weekday payload should be treated as unchanged')
}
