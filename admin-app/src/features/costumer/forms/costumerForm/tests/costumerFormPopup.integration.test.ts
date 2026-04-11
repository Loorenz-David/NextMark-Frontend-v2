import { homePopupRegistry } from '@/features/home-route-operations/registry/homePopups'
import { costumerPopupRegistry } from '@/features/costumer/registry/costumerPopups.registry'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormPopupIntegrationTests = () => {
  assert('costumer.form' in costumerPopupRegistry, 'costumer popup registry should include costumer.form key')
  assert('costumer.form' in homePopupRegistry, 'home popup registry should include costumer.form key')
}
