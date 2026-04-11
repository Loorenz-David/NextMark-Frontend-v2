import { resolveCostumerFormCloseRequest } from '../providers/useCostumerFormCloseController'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormEmbeddedCloseTests = () => {
  const unsaved = resolveCostumerFormCloseRequest(true)
  assert(
    unsaved.nextCloseState === 'confirming',
    'embedded form with unsaved changes should enter confirming state before close',
  )
  assert(
    !unsaved.shouldCloseImmediately,
    'embedded form with unsaved changes should not close immediately',
  )

  const clean = resolveCostumerFormCloseRequest(false)
  assert(clean.nextCloseState === 'idle', 'clean embedded form should stay idle on close')
  assert(clean.shouldCloseImmediately, 'clean embedded form should close immediately')
}

