import { describe, expect, it } from 'vitest'
import {
  DESKTOP_MIN_WIDTH,
  MOBILE_MAX_WIDTH,
  resolveViewportSizeClass,
  TABLET_MIN_WIDTH,
} from './viewport.config'

describe('viewport size class', () => {
  it('keeps the phone and wide desktop boundaries exact', () => {
    expect(TABLET_MIN_WIDTH).toBe(MOBILE_MAX_WIDTH + 1)
    expect(DESKTOP_MIN_WIDTH).toBe(1440)
    expect(resolveViewportSizeClass(true, false)).toBe('phone')
    expect(resolveViewportSizeClass(false, false)).toBe('tablet')
    expect(resolveViewportSizeClass(false, true)).toBe('desktop')
  })
})
