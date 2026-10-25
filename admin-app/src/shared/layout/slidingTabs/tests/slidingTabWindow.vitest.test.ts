import { describe, expect, it } from 'vitest'

import {
  nextTabWindowStart,
  resolveTabWindowStart,
} from '../slidingTabWindow.domain'

describe('resolveTabWindowStart', () => {
  it('keeps the window when the index is already visible', () => {
    expect(resolveTabWindowStart(1, 0, 4)).toBe(0)
    expect(resolveTabWindowStart(2, 1, 4)).toBe(1)
  })

  it('moves just enough to show an index past the window', () => {
    expect(resolveTabWindowStart(3, 0, 4)).toBe(1)
    expect(resolveTabWindowStart(6, 0, 7)).toBe(4)
  })

  it('moves back to show an index before the window', () => {
    expect(resolveTabWindowStart(0, 1, 4)).toBe(0)
  })

  it('never starts past the last full window', () => {
    expect(resolveTabWindowStart(0, 5, 4)).toBe(0)
    expect(resolveTabWindowStart(2, 3, 4)).toBe(1)
  })

  it('stays at 0 when everything fits', () => {
    expect(resolveTabWindowStart(2, 0, 3)).toBe(0)
  })
})

describe('nextTabWindowStart', () => {
  it('slides to the last full window when less than a page remains', () => {
    expect(nextTabWindowStart(0, 4)).toBe(1)
  })

  it('slides a whole page when there is room', () => {
    expect(nextTabWindowStart(0, 8)).toBe(3)
    expect(nextTabWindowStart(3, 8)).toBe(5)
  })

  it('wraps back to the start from the end', () => {
    expect(nextTabWindowStart(1, 4)).toBe(0)
    expect(nextTabWindowStart(5, 8)).toBe(0)
  })

  it('stays at 0 when everything fits', () => {
    expect(nextTabWindowStart(0, 3)).toBe(0)
  })
})
