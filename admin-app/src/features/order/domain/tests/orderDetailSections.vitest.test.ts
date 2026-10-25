import { describe, expect, it } from 'vitest'

import {
  nextSectionWindowStart,
  resolveSectionWindowStart,
} from '../orderDetailSections.domain'

describe('resolveSectionWindowStart', () => {
  it('keeps the window when the index is already visible', () => {
    expect(resolveSectionWindowStart(1, 0, 4)).toBe(0)
    expect(resolveSectionWindowStart(2, 1, 4)).toBe(1)
  })

  it('moves just enough to show an index past the window', () => {
    expect(resolveSectionWindowStart(3, 0, 4)).toBe(1)
    expect(resolveSectionWindowStart(6, 0, 7)).toBe(4)
  })

  it('moves back to show an index before the window', () => {
    expect(resolveSectionWindowStart(0, 1, 4)).toBe(0)
  })

  it('never starts past the last full window', () => {
    expect(resolveSectionWindowStart(0, 5, 4)).toBe(0)
    expect(resolveSectionWindowStart(2, 3, 4)).toBe(1)
  })

  it('stays at 0 when everything fits', () => {
    expect(resolveSectionWindowStart(2, 0, 3)).toBe(0)
  })
})

describe('nextSectionWindowStart', () => {
  it('slides to the last full window when less than a page remains', () => {
    expect(nextSectionWindowStart(0, 4)).toBe(1)
  })

  it('slides a whole page when there is room', () => {
    expect(nextSectionWindowStart(0, 8)).toBe(3)
    expect(nextSectionWindowStart(3, 8)).toBe(5)
  })

  it('wraps back to the start from the end', () => {
    expect(nextSectionWindowStart(1, 4)).toBe(0)
    expect(nextSectionWindowStart(5, 8)).toBe(0)
  })

  it('stays at 0 when everything fits', () => {
    expect(nextSectionWindowStart(0, 3)).toBe(0)
  })
})
