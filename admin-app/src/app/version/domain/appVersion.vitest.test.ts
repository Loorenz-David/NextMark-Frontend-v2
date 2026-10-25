import { describe, expect, it } from 'vitest'

import {
  didReloadMissTarget,
  isEditableElement,
  isWithinThrottle,
  parseVersionPayload,
  shouldApplyUpdate,
  VERSION_CHECK_THROTTLE_MS,
} from './appVersion'
import { formatBuildStamp } from './buildStamp'

describe('shouldApplyUpdate', () => {
  const base = {
    runningId: 'old',
    remoteId: 'new',
    blockers: [] as string[],
    lastAttemptedId: null,
  }

  it.each([
    ['a newer build with nothing blocking', base, true],
    ['the same build', { ...base, remoteId: 'old' }, false],
    ['a failed or malformed check', { ...base, remoteId: null }, false],
    ['an active blocker', { ...base, blockers: ['order-form'] }, false],
    ['several blockers', { ...base, blockers: ['focused-field', 'home-drag'] }, false],
    ['a build this session already reloaded towards (loop guard)', { ...base, lastAttemptedId: 'new' }, false],
    ['a newer deploy after a missed attempt', { ...base, remoteId: 'newer', lastAttemptedId: 'new' }, true],
    ['a stale attempt marker for the running build', { ...base, lastAttemptedId: 'old' }, true],
    ['a blocker plus the loop guard', { ...base, blockers: ['order-form'], lastAttemptedId: 'new' }, false],
  ])('%s → %s', (_label, input, expected) => {
    expect(shouldApplyUpdate(input)).toBe(expected)
  })
})

describe('didReloadMissTarget', () => {
  it('reports only an attempt that left another build running', () => {
    expect(didReloadMissTarget('old', null)).toBe(false)
    expect(didReloadMissTarget('new', 'new')).toBe(false)
    expect(didReloadMissTarget('old', 'new')).toBe(true)
  })
})

describe('parseVersionPayload', () => {
  it('reads the payload the build emits', () => {
    expect(
      parseVersionPayload('{"buildId":"1761330000000","builtAt":"2026-10-24T18:05:00.000Z"}'),
    ).toEqual({ buildId: '1761330000000', builtAt: '2026-10-24T18:05:00.000Z' })
  })

  it('tolerates a missing builtAt', () => {
    expect(parseVersionPayload('{"buildId":"abc"}')).toEqual({ buildId: 'abc', builtAt: null })
  })

  it.each([
    ['empty body', ''],
    ['whitespace', '   '],
    ['captive portal HTML', '<!doctype html><html><body>Sign in to Wi-Fi</body></html>'],
    ['the SPA index served as a fallback', '<!DOCTYPE html><html lang="en"><head></head></html>'],
    ['truncated JSON', '{"buildId":"abc"'],
    ['JSON null', 'null'],
    ['a JSON string', '"abc"'],
    ['a JSON number', '1761330000000'],
    ['a JSON array', '["abc"]'],
    ['an object without buildId', '{"version":"abc"}'],
    ['a numeric buildId', '{"buildId":1761330000000}'],
    ['an empty buildId', '{"buildId":""}'],
    ['a blank buildId', '{"buildId":"   "}'],
  ])('%s → no update', (_label, body) => {
    expect(parseVersionPayload(body)).toBeNull()
    expect(
      shouldApplyUpdate({
        runningId: 'old',
        remoteId: parseVersionPayload(body)?.buildId ?? null,
        blockers: [],
        lastAttemptedId: null,
      }),
    ).toBe(false)
  })
})

describe('isWithinThrottle', () => {
  it('lets the first check through and holds a second inside the window', () => {
    expect(isWithinThrottle(null, 1_000)).toBe(false)
    expect(isWithinThrottle(1_000, 1_000 + VERSION_CHECK_THROTTLE_MS - 1)).toBe(true)
    expect(isWithinThrottle(1_000, 1_000 + VERSION_CHECK_THROTTLE_MS)).toBe(false)
  })
})

describe('isEditableElement', () => {
  const element = (tagName: string, inputType: string | null = null, isContentEditable = false) => ({
    tagName,
    inputType,
    isContentEditable,
  })

  it('treats text entry as editable', () => {
    expect(isEditableElement(element('INPUT', 'text'))).toBe(true)
    expect(isEditableElement(element('INPUT', 'email'))).toBe(true)
    expect(isEditableElement(element('INPUT', null))).toBe(true)
    expect(isEditableElement(element('TEXTAREA'))).toBe(true)
    expect(isEditableElement(element('SELECT'))).toBe(true)
    expect(isEditableElement(element('DIV', null, true))).toBe(true)
  })

  it('ignores buttons and plain elements', () => {
    expect(isEditableElement(element('INPUT', 'button'))).toBe(false)
    expect(isEditableElement(element('INPUT', 'submit'))).toBe(false)
    expect(isEditableElement(element('BUTTON'))).toBe(false)
    expect(isEditableElement(element('BODY'))).toBe(false)
  })
})

describe('formatBuildStamp', () => {
  it('shows a short id and the UTC build minute', () => {
    expect(formatBuildStamp('1761330000000', '2026-10-24T18:05:42.123Z')).toBe(
      'Build 000000 · 2026-10-24 18:05 UTC',
    )
  })

  it('falls back to the id when the timestamp is unreadable', () => {
    expect(formatBuildStamp('1761330412345', 'not a date')).toBe('Build 412345')
  })
})
