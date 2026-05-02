import { applySelectedCostumerToOrderForm } from '../flows/orderFormCostumerApply.flow'
import type { OrderFormState } from '../state/OrderForm.types'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildState = (): OrderFormState => ({
  client_id: 'order-client-1',
  order_plan_objective: null,
  operation_type: 'dropoff',
  reference_number: 'REF-1',
  external_source: '',
  external_tracking_number: '',
  external_tracking_link: '',
  tracking_number: '',
  tracking_link: '',
  client_first_name: 'Old',
  client_last_name: 'Name',
  client_email: 'old@name.com',
  client_primary_phone: { prefix: '+1', number: '1111111111' },
  client_secondary_phone: { prefix: '+1', number: '2222222222' },
  client_address: null,
  delivery_windows: [],
  delivery_plan_id: null,
  general_note: '',
  customer_note: '',
  order_notes_source: [],
})

export const runOrderFormCostumerApplyFlowTests = () => {
  {
    const state = buildState()
    const result = applySelectedCostumerToOrderForm({
      selectedCostumer: null,
      previousState: state,
    })

    assert(result === state, 'null selected costumer should be a no-op')
  }

  {
    const state = buildState()
    const result = applySelectedCostumerToOrderForm({
      selectedCostumer: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@doe.com',
        default_primary_phone: { phone: { prefix: '+46', number: '700111222' } },
        default_secondary_phone: { phone: { prefix: '+46', number: '700333444' } },
        default_address: {
          address: {
            street_address: 'Main 1',
            city: 'Stockholm',
            country: 'SE',
            postal_code: '11111',
            coordinates: { lat: 59.3293, lng: 18.0686 },
          },
        },
      } as never,
      previousState: state,
    })

    assert(result.client_first_name === 'John', 'first_name should be mapped')
    assert(result.client_last_name === 'Doe', 'last_name should be mapped')
    assert(result.client_email === 'john@doe.com', 'email should be mapped')
    assert(result.client_primary_phone.number === '700111222', 'primary phone should be mapped')
    assert(result.client_secondary_phone.number === '700333444', 'secondary phone should be mapped')
    assert(result.client_address?.street_address === 'Main 1', 'address should be mapped')
  }
}
