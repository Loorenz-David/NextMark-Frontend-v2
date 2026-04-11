import {
  selectByMode,
  selectMultiple,
  selectRange,
  selectSingle,
} from '../model/selection.machine'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runSelectionMachineTests = () => {
  const selected = selectSingle(null, new Date(2026, 2, 5, 21, 15))
  assert(selected instanceof Date, 'Single mode should return Date')
  if (selected instanceof Date) {
    assert(selected.getHours() === 0, 'Single mode output should be normalized')
  }

  const normalizedSeed = new Date(2026, 2, 5)
  const unchangedSingle = selectSingle(normalizedSeed, new Date(2026, 2, 5, 18, 10))
  assert(unchangedSingle === normalizedSeed, 'Single mode should keep original reference when value does not change')

  const multipleSeed = [new Date(2026, 2, 2)]
  const multipleAdded = selectMultiple(multipleSeed, new Date(2026, 2, 4))

  assert(Array.isArray(multipleAdded), 'Multiple mode should return an array')
  assert(multipleAdded !== multipleSeed, 'Multiple mode should return a new reference when changed')
  assert(multipleSeed.length === 1, 'Multiple mode must not mutate seed array')

  const multipleRemoved = selectMultiple(multipleAdded, new Date(2026, 2, 2))
  assert(Array.isArray(multipleRemoved) && multipleRemoved.length === 1, 'Toggling selected date should remove it')

  const rangeSeed = { start: new Date(2026, 2, 2), end: null as Date | null }
  const rangeCompleted = selectRange(rangeSeed, new Date(2026, 2, 8))

  assert(typeof rangeCompleted === 'object' && rangeCompleted !== null, 'Range mode should return an object')
  assert(rangeCompleted !== rangeSeed, 'Range mode should return a new object reference when changed')
  assert(rangeSeed.end === null, 'Range mode must not mutate input range object')

  if (rangeCompleted && typeof rangeCompleted === 'object' && !Array.isArray(rangeCompleted) && 'start' in rangeCompleted && 'end' in rangeCompleted) {
    assert(rangeCompleted.start?.getDate() === 2, 'Range should keep smallest date as start')
    assert(rangeCompleted.end?.getDate() === 8, 'Range should keep largest date as end')
  }

  const restartedRange = selectRange(rangeCompleted, new Date(2026, 2, 12))
  if (restartedRange && typeof restartedRange === 'object' && !Array.isArray(restartedRange) && 'start' in restartedRange && 'end' in restartedRange) {
    assert(restartedRange.start?.getDate() === 12, 'Completed range click should restart from clicked date')
    assert(restartedRange.end === null, 'Completed range click should clear end')
  }

  const readonlyValue = [new Date(2026, 2, 1)]
  const readonlyResult = selectByMode('readonly', readonlyValue, new Date(2026, 2, 4))
  assert(readonlyResult === readonlyValue, 'Readonly mode should return original reference when no change occurs')
}
