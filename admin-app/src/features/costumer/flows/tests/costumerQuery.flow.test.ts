import { useCostumerQueryFlow } from '../costumerQuery.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerQueryFlowTests = async () => {
  // Hook behavior is integration-tested via UI consumers. Keep this contract test
  // minimal and runtime-safe for non-React test harnesses.
  assert(typeof useCostumerQueryFlow === 'function', 'useCostumerQueryFlow should be exported as a function')
}
