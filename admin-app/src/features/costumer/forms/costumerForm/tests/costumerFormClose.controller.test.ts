import { resolveCostumerFormCloseRequest } from '../providers/useCostumerFormCloseController'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormCloseControllerTests = () => {
  const unsaved = resolveCostumerFormCloseRequest(true)
  assert(unsaved.nextCloseState === 'confirming', 'unsaved changes should request confirmation')
  assert(!unsaved.shouldCloseImmediately, 'unsaved changes should not close immediately')

  const clean = resolveCostumerFormCloseRequest(false)
  assert(clean.nextCloseState === 'idle', 'clean form should remain idle')
  assert(clean.shouldCloseImmediately, 'clean form should close immediately')
}
