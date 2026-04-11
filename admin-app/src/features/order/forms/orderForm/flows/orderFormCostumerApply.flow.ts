import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'

import type { Costumer } from '@/features/costumer'

import type { OrderFormState } from '../state/OrderForm.types'

const mapCostumerPhone = (
  value: Costumer['default_primary_phone'] | Costumer['default_secondary_phone'],
  fallback: OrderFormState['client_primary_phone'] | OrderFormState['client_secondary_phone'],
) => ({
  prefix: value?.phone?.prefix ?? fallback.prefix,
  number: value?.phone?.number ?? fallback.number,
})

export const applySelectedCostumerToOrderForm = ({
  selectedCostumer,
  previousState,
}: {
  selectedCostumer: Costumer | null
  previousState: OrderFormState
}): OrderFormState => {
  if (!selectedCostumer) {
    return previousState
  }

  return {
    ...previousState,
    client_first_name: selectedCostumer.first_name ?? previousState.client_first_name,
    client_last_name: selectedCostumer.last_name ?? previousState.client_last_name,
    client_email: selectedCostumer.email ?? previousState.client_email,
    client_primary_phone: mapCostumerPhone(
      selectedCostumer.default_primary_phone,
      previousState.client_primary_phone,
    ),
    client_secondary_phone: mapCostumerPhone(
      selectedCostumer.default_secondary_phone,
      previousState.client_secondary_phone,
    ),
    client_address: selectedCostumer.default_address?.address ?? previousState.client_address,
  }
}

export const useApplySelectedCostumerFlow = ({
  selectedCostumer,
  setFormState,
}: {
  selectedCostumer: Costumer | null
  setFormState: Dispatch<SetStateAction<OrderFormState>>
}) => {
  useEffect(() => {
    if (!selectedCostumer) return
    

    setFormState((previousState) =>
      applySelectedCostumerToOrderForm({
        selectedCostumer,
        previousState,
      }),
    )
  }, [selectedCostumer, setFormState])
}
