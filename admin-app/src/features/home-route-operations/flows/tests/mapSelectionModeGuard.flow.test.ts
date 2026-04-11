import { resolveSelectionConflict } from '../mapSelectionModeGuard.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runMapSelectionModeGuardFlowTests = () => {
  {
    const decision = resolveSelectionConflict({
      isOrderMode: true,
      wasOrderMode: false,
      isRouteGroupMode: true,
      wasRouteGroupMode: true,
    })
    assert(decision === 'disable_local_delivery', 'order activation should disable local delivery mode')
  }

  {
    const decision = resolveSelectionConflict({
      isOrderMode: true,
      wasOrderMode: true,
      isRouteGroupMode: true,
      wasRouteGroupMode: false,
    })
    assert(decision === 'disable_order', 'local delivery activation should disable order mode')
  }

  {
    const decision = resolveSelectionConflict({
      isOrderMode: true,
      wasOrderMode: true,
      isRouteGroupMode: false,
      wasRouteGroupMode: false,
    })
    assert(decision === 'none', 'no conflict should produce no action')
  }
}
