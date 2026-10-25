import { describe, expect, it, vi } from 'vitest'

import { createAppVersionChecker, type AppVersionCheckerPorts } from './appVersionChecker'
import { VERSION_CHECK_THROTTLE_MS } from './domain/appVersion'
import { getActiveReloadBlockers, registerReloadBlocker, subscribeReloadBlockers } from './reloadBlockers'

const createHarness = (overrides: Partial<AppVersionCheckerPorts> = {}) => {
  let clock = 1_000
  let attemptedId: string | null = null
  const blockers: string[] = []

  const ports = {
    runningBuildId: 'old',
    fetchRemoteBuildId: vi.fn(async (): Promise<string | null> => 'new'),
    now: () => clock,
    getBlockers: () => [...blockers],
    readAttemptedId: () => attemptedId,
    writeAttemptedId: vi.fn((id: string) => {
      attemptedId = id
    }),
    refreshEntryDocument: vi.fn(async () => true),
    reload: vi.fn(),
    onCheck: vi.fn(),
    ...overrides,
  }

  return {
    ports,
    checker: createAppVersionChecker(ports),
    advance: (ms: number) => {
      clock += ms
    },
    blockers,
    setAttemptedId: (id: string | null) => {
      attemptedId = id
    },
  }
}

describe('createAppVersionChecker throttle', () => {
  it('runs one fetch for two triggers inside 30 s', async () => {
    const { checker, ports, advance } = createHarness({
      fetchRemoteBuildId: vi.fn(async () => 'old'),
    })

    await checker.check()
    advance(10_000)
    await checker.check()

    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(ports.onCheck).toHaveBeenCalledTimes(1)
  })

  it('fetches again once the window has passed', async () => {
    const { checker, ports, advance } = createHarness({
      fetchRemoteBuildId: vi.fn(async () => 'old'),
    })

    await checker.check()
    advance(VERSION_CHECK_THROTTLE_MS)
    await checker.check()

    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(2)
  })

  it('shares one in-flight fetch between simultaneous triggers', async () => {
    const { checker, ports } = createHarness({
      fetchRemoteBuildId: vi.fn(async () => 'old'),
    })

    await Promise.all([checker.check(), checker.check({ force: true })])

    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(1)
  })

  it('lets a forced check (chunk load failure) bypass the window', async () => {
    const { checker, ports, advance } = createHarness({
      fetchRemoteBuildId: vi.fn(async () => 'old'),
    })

    await checker.check()
    advance(1_000)
    await checker.check({ force: true })

    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(2)
  })
})

describe('createAppVersionChecker apply', () => {
  it('refreshes the entry document, records the target, then reloads', async () => {
    const { checker, ports } = createHarness()

    await checker.check()

    expect(ports.refreshEntryDocument).toHaveBeenCalledTimes(1)
    expect(ports.writeAttemptedId).toHaveBeenCalledWith('new')
    expect(ports.reload).toHaveBeenCalledTimes(1)
  })

  it('does nothing when the deployed build is the running one', async () => {
    const { checker, ports } = createHarness({
      fetchRemoteBuildId: vi.fn(async () => 'old'),
    })

    await checker.check()

    expect(ports.refreshEntryDocument).not.toHaveBeenCalled()
    expect(ports.reload).not.toHaveBeenCalled()
  })

  it.each([
    ['a failed check', async () => null],
    ['a rejected fetch port', async () => Promise.reject(new Error('offline'))],
  ])('never reloads on %s', async (_label, fetchRemoteBuildId) => {
    const { checker, ports } = createHarness({ fetchRemoteBuildId: vi.fn(fetchRemoteBuildId) })

    await checker.check()

    expect(ports.reload).not.toHaveBeenCalled()
  })

  it('does not apply an earlier finding on a later failed check', async () => {
    const fetchRemoteBuildId = vi.fn(async (): Promise<string | null> => 'new')
    const { checker, ports, blockers, advance } = createHarness({ fetchRemoteBuildId })
    blockers.push('order-form')
    await checker.check()

    blockers.length = 0
    fetchRemoteBuildId.mockImplementation(async () => null)
    advance(VERSION_CHECK_THROTTLE_MS)
    await checker.check()

    expect(ports.reload).not.toHaveBeenCalled()
  })

  it.each([
    ['cannot refetch index.html', async () => false],
    ['the refetch throws', async () => Promise.reject(new Error('offline'))],
  ])('does not reload when it %s', async (_label, refreshEntryDocument) => {
    const { checker, ports } = createHarness({ refreshEntryDocument: vi.fn(refreshEntryDocument) })

    await checker.check()

    expect(ports.writeAttemptedId).not.toHaveBeenCalled()
    expect(ports.reload).not.toHaveBeenCalled()
  })

  it('defers while blocked and applies when retried after the blocker clears', async () => {
    const { checker, ports, blockers } = createHarness()
    blockers.push('order-form')

    await checker.check()
    expect(ports.reload).not.toHaveBeenCalled()

    blockers.length = 0
    await checker.retryPending()
    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(ports.reload).toHaveBeenCalledTimes(1)
  })

  it('applies a deferred update on a throttled trigger without refetching', async () => {
    const { checker, ports, blockers, advance } = createHarness()
    blockers.push('focused-field')
    await checker.check()

    blockers.length = 0
    advance(5_000)
    await checker.check()

    expect(ports.fetchRemoteBuildId).toHaveBeenCalledTimes(1)
    expect(ports.reload).toHaveBeenCalledTimes(1)
  })

  it('re-checks blockers after the refetch and aborts if one appeared', async () => {
    const refreshEntryDocument = vi.fn(async () => {
      harness.blockers.push('focused-field')
      return true
    })
    const harness = createHarness({ refreshEntryDocument })

    await harness.checker.check()

    expect(harness.ports.reload).not.toHaveBeenCalled()
    expect(harness.ports.writeAttemptedId).not.toHaveBeenCalled()
  })

  it('does not reload twice towards a build that did not take effect (loop guard)', async () => {
    const { checker, ports, setAttemptedId } = createHarness()
    setAttemptedId('new')

    await checker.check()

    expect(ports.reload).not.toHaveBeenCalled()
  })
})

describe('reload blocker registry', () => {
  it('counts each registration and notifies on change', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeReloadBlockers(listener)

    const releaseFirst = registerReloadBlocker('order-form')
    const releaseSecond = registerReloadBlocker('order-form')
    expect(getActiveReloadBlockers()).toEqual(['order-form', 'order-form'])

    releaseFirst()
    releaseFirst()
    expect(getActiveReloadBlockers()).toEqual(['order-form'])

    releaseSecond()
    expect(getActiveReloadBlockers()).toEqual([])
    expect(listener).toHaveBeenCalledTimes(4)

    unsubscribe()
  })
})
