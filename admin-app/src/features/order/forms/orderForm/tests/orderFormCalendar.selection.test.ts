import { resolveCalendarSelectionToBoundaryValues } from '../components/OrderFormDeliveryWindowCalendar'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderFormCalendarSelectionTests = () => {
  {
    const single = resolveCalendarSelectionToBoundaryValues({
      mode: 'single',
      nextValue: new Date('2026-03-05T00:00:00.000Z'),
    })

    assert(single.earliest === '2026-03-05', 'single mode should set earliest')
    assert(single.latest === '2026-03-05', 'single mode should set latest')
  }

  {
    const multiple = resolveCalendarSelectionToBoundaryValues({
      mode: 'multiple',
      nextValue: [
        new Date('2026-03-08T00:00:00.000Z'),
        new Date('2026-03-06T00:00:00.000Z'),
        new Date('2026-03-10T00:00:00.000Z'),
      ],
    })

    assert(multiple.earliest === '2026-03-06', 'multiple mode should select min date as earliest')
    assert(multiple.latest === '2026-03-10', 'multiple mode should select max date as latest')
  }

  {
    const range = resolveCalendarSelectionToBoundaryValues({
      mode: 'range',
      nextValue: {
        start: new Date('2026-03-02T00:00:00.000Z'),
        end: new Date('2026-03-09T00:00:00.000Z'),
      },
    })

    assert(range.earliest === '2026-03-02', 'range mode should map start to earliest')
    assert(range.latest === '2026-03-09', 'range mode should map end to latest')
  }
}
