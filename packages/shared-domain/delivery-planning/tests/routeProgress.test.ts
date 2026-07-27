import { buildRouteProgressSegments } from '../routeProgress'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const paths = (states: boolean[]) => buildRouteProgressSegments({
  routeStarted: true,
  startLegPolyline: 'start',
  stops: states.map((isTerminal, index) => ({
    toNextPolyline: `stop-${index + 1}`,
    isTerminal,
  })),
  endLegPolyline: 'end',
})

export const runRouteProgressTests = () => {
  {
    const segments = buildRouteProgressSegments({
      routeStarted: false,
      startLegPolyline: 'start',
      stops: [
        { toNextPolyline: 'one', isTerminal: false },
        { toNextPolyline: 'two', isTerminal: false },
      ],
      endLegPolyline: 'end',
    })

    assert(
      segments.every((segment) => segment.state === 'completed'),
      'an unstarted route should retain the established full-route treatment',
    )
  }

  {
    const segments = paths([false, false])
    assert(segments[0]?.state === 'completed', 'the start leg should always use the completed treatment')
    assert(segments[1]?.state === 'pending', 'the first intermediate leg should be pending with no terminal stops')
    assert(segments.at(-1)?.state === 'pending', 'the end leg should be pending until every stop is terminal')
  }

  {
    const segments = paths([true, false, false])
    assert(segments[1]?.state === 'completed', 'one terminal stop should advance the first intermediate leg')
    assert(segments[2]?.state === 'pending', 'later intermediate legs should remain pending')
  }

  {
    const segments = paths([true, true])
    assert(
      segments.every((segment) => segment.state === 'completed'),
      'all terminal stops should complete every route segment',
    )
  }

  {
    const segments = buildRouteProgressSegments({
      routeStarted: true,
      startLegPolyline: null,
      stops: [
        { toNextPolyline: null, isTerminal: true },
        { toNextPolyline: 'available', isTerminal: false },
      ],
      endLegPolyline: null,
    })
    assert(
      segments.length === 1 && segments[0]?.path === 'available',
      'missing encoded polylines should be omitted',
    )
  }
}
