import type { Costumer } from '@/features/costumer'

import {
  resolveExactCostumerEmailMatch,
  shouldLookupCostumerByEmail,
} from '../flows/orderFormCostumerLookup.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderFormCostumerLookupFlowTests = () => {
  assert(
    !shouldLookupCostumerByEmail({
      enabled: true,
      mode: 'create',
      email: 'invalid-email',
      selectedCostumerEmail: '',
      lastResolvedEmail: '',
    }),
    'invalid email should not query',
  )

  assert(
    !shouldLookupCostumerByEmail({
      enabled: true,
      mode: 'create',
      email: 'john@doe.com',
      selectedCostumerEmail: 'john@doe.com',
      lastResolvedEmail: '',
    }),
    'same as selected costumer email should not query',
  )

  assert(
    !shouldLookupCostumerByEmail({
      enabled: true,
      mode: 'create',
      email: 'john@doe.com',
      selectedCostumerEmail: '',
      lastResolvedEmail: 'john@doe.com',
    }),
    'same as last resolved email should not query',
  )

  assert(
    shouldLookupCostumerByEmail({
      enabled: true,
      mode: 'create',
      email: 'john@doe.com',
      selectedCostumerEmail: 'other@doe.com',
      lastResolvedEmail: '',
    }),
    'valid new email should query',
  )

  assert(
    !shouldLookupCostumerByEmail({
      enabled: false,
      mode: 'create',
      email: 'john@doe.com',
      selectedCostumerEmail: '',
      lastResolvedEmail: '',
    }),
    'disabled lookup should not query',
  )

  assert(
    !shouldLookupCostumerByEmail({
      enabled: true,
      mode: 'edit',
      email: 'john@doe.com',
      selectedCostumerEmail: '',
      lastResolvedEmail: '',
    }),
    'edit mode should not query',
  )

  assert(
    !resolveExactCostumerEmailMatch({
      candidates: [
        {
          client_id: 'costumer-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@doe.com',
        },
      ] as Costumer[],
      normalizedEmail: 'jane@doe.com',
    }),
    'lookup should ignore response entries that do not exactly match input email',
  )

  assert(
    Boolean(
      resolveExactCostumerEmailMatch({
        candidates: [
        {
          client_id: 'costumer-2',
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@doe.com',
        },
        ] as Costumer[],
        normalizedEmail: 'jane@doe.com',
      }),
    ),
    'lookup should resolve exact email match when present',
  )
}
