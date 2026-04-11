import { buildRafSettleScheduler } from '../homeDesktopRailSettle.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runHomeDesktopRailSettleFlowTests = () => {
  {
    const queued: FrameRequestCallback[] = []
    let settleCalls = 0

    const schedule = buildRafSettleScheduler(
      (callback) => {
        queued.push(callback)
        return queued.length
      },
      () => {
        settleCalls += 1
      },
    )

    schedule()
    schedule()
    schedule()

    assert(queued.length === 1, 'scheduler should queue exactly one frame while pending')
    assert(settleCalls === 0, 'settle should not run before the frame executes')

    queued[0](0)

    assert(settleCalls === 1, 'settle should run once when frame executes')
  }

  {
    const queued: FrameRequestCallback[] = []
    let settleCalls = 0

    const schedule = buildRafSettleScheduler(
      (callback) => {
        queued.push(callback)
        return queued.length
      },
      () => {
        settleCalls += 1
      },
    )

    schedule()
    queued[0](0)
    schedule()

    assert(queued.length === 2, 'scheduler should allow re-queueing after previous frame settles')
    assert(settleCalls === 1, 'first frame should settle exactly once')
  }
}
