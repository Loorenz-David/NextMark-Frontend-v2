import { buildMonthMatrix } from '../domain/monthMatrix.builder'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runMonthMatrixBuilderTests = () => {
  const matrix = buildMonthMatrix({ year: 2026, month: 2, weekStartsOn: 1 })

  assert(matrix.length === 6, 'Month matrix should contain 6 rows')
  assert(matrix.every((week) => week.length === 7), 'Each matrix row should contain 7 days')

  const firstDate = matrix[0][0].date
  assert(firstDate.getDay() === 1, 'Matrix should start on Monday when weekStartsOn=1')

  const flat = matrix.flat()
  const currentMonthDays = flat.filter((day) => day.isCurrentMonth)

  assert(currentMonthDays.length === 31, 'March 2026 should include 31 current-month days')
  assert(flat.some((day) => day.date.getMonth() === 1), 'Matrix should include previous-month days')
  assert(flat.some((day) => day.date.getMonth() === 3), 'Matrix should include next-month days')
}
