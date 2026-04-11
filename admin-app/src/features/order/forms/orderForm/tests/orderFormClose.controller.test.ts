import { resolveCloseRequest } from '../providers/useOrderFormCloseController'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderFormCloseControllerTests = () => {
  const unsaved = resolveCloseRequest(true)
  assert(unsaved.nextCloseState === 'confirming', 'unsaved changes should request confirmation')
  assert(!unsaved.shouldCloseImmediately, 'unsaved changes should not close immediately')

  const clean = resolveCloseRequest(false)
  assert(clean.nextCloseState === 'idle', 'clean form should remain idle')
  assert(clean.shouldCloseImmediately, 'clean form should close immediately')
}
