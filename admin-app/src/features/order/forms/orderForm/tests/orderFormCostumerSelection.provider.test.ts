import type { Costumer } from '@/features/costumer'

import {
  resolvePendingCostumerAction,
  shouldPromptCostumerSelection,
} from '../providers/OrderForm.provider'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const currentCostumer = {
  id: 10,
  client_id: 'costumer-10',
  first_name: 'Current',
  last_name: 'Costumer',
} as Costumer

const pendingCostumer = {
  id: 20,
  client_id: 'costumer-20',
  first_name: 'Pending',
  last_name: 'Costumer',
} as Costumer

export const runOrderFormCostumerSelectionProviderTests = () => {
  assert(
    shouldPromptCostumerSelection({ mode: 'edit', source: 'panel' }),
    'edit mode panel selection should open prompt',
  )
  assert(
    !shouldPromptCostumerSelection({ mode: 'create', source: 'panel' }),
    'create mode panel selection should apply directly',
  )
  assert(
    !shouldPromptCostumerSelection({ mode: 'edit', source: 'lookup' }),
    'lookup source should not prompt',
  )

  {
    const decision = resolvePendingCostumerAction({
      action: 'replace',
      pendingCostumer,
      pendingCostumerSource: 'embedded',
      currentSelectedCostumer: currentCostumer,
      currentSelectedCostumerSource: 'panel',
    })

    assert(decision.selectedCostumer === pendingCostumer, 'replace should select pending costumer')
    assert(
      decision.selectedCostumerSource === 'embedded',
      'replace should keep pending source when available',
    )
    assert(decision.shouldApplySnapshot, 'replace should apply costumer snapshot to order form')
  }

  {
    const decision = resolvePendingCostumerAction({
      action: 'keep',
      pendingCostumer,
      pendingCostumerSource: null,
      currentSelectedCostumer: currentCostumer,
      currentSelectedCostumerSource: 'panel',
    })

    assert(decision.selectedCostumer === pendingCostumer, 'keep should still switch selected costumer')
    assert(
      decision.selectedCostumerSource === 'panel',
      'keep should fallback source to panel when pending source is missing',
    )
    assert(!decision.shouldApplySnapshot, 'keep should preserve existing order snapshot values')
  }

  {
    const decision = resolvePendingCostumerAction({
      action: 'cancel',
      pendingCostumer,
      pendingCostumerSource: 'panel',
      currentSelectedCostumer: currentCostumer,
      currentSelectedCostumerSource: 'panel',
    })

    assert(decision.selectedCostumer === currentCostumer, 'cancel should keep current selected costumer')
    assert(
      decision.selectedCostumerSource === 'panel',
      'cancel should keep current selected source',
    )
    assert(!decision.shouldApplySnapshot, 'cancel should not apply costumer snapshot')
  }
}
