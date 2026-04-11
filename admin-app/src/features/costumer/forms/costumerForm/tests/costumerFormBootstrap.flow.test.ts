import { buildCostumerFormInitialState } from '../flows/costumerFormBootstrap.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormBootstrapFlowTests = () => {
  const createState = buildCostumerFormInitialState({
    mode: 'create',
    costumer: null,
  })

  assert(createState.first_name === '', 'create state should initialize first_name as empty')
  assert(createState.last_name === '', 'create state should initialize last_name as empty')
  assert(createState.email === '', 'create state should initialize email as empty')
  assert(createState.addresses.length === 1, 'create state should initialize one default address')
  assert(createState.phones.length === 2, 'create state should initialize primary and secondary phone slots')
  assert(createState.operating_hours.length === 0, 'create state should initialize empty operating hours')
  assert(Boolean(createState.addresses[0]?.client_id), 'default address should include a client_id')
  assert(Boolean(createState.phones[0]?.client_id), 'default phone should include a client_id')

  const editState = buildCostumerFormInitialState({
    mode: 'edit',
    costumer: {
      id: 44,
      client_id: 'costumer-44',
      first_name: 'Martha',
      last_name: 'Jensen',
      email: 'martha@demo.com',
      addresses: [
        { client_id: 'addr-1', label: 'default', address: null, is_default: true },
        { client_id: 'addr-2', label: 'other', address: null, is_default: false },
      ],
      phones: [
        { client_id: 'phone-1', label: 'default', phone: { prefix: '+1', number: '999111222' }, is_default_primary: true },
        { client_id: 'phone-2', label: 'secondary', phone: { prefix: '+1', number: '333444555' }, is_default_secondary: true },
      ],
      operating_hours: [
        { client_id: 'hours-2', weekday: 2, open_time: '10:00', close_time: '18:00', is_closed: false },
        { client_id: 'hours-0', weekday: 0, open_time: '09:00', close_time: '17:00', is_closed: false },
      ],
    },
  })

  assert(editState.addresses[0]?.client_id === 'addr-1', 'edit state should use first address as editable default')
  assert(editState.phones[0]?.client_id === 'phone-1', 'edit state should use first phone as editable default')
  assert(editState.addresses[1]?.client_id === 'addr-2', 'edit state should preserve trailing address entries')
  assert(editState.phones[1]?.client_id === 'phone-2', 'edit state should keep secondary phone in second slot')
  assert(editState.operating_hours[0]?.weekday === 0, 'edit state should sort operating hours by weekday')
  assert(editState.operating_hours[1]?.weekday === 2, 'edit state should preserve all operating hours')

  const editWithMissingLists = buildCostumerFormInitialState({
    mode: 'edit',
    costumer: {
      id: 45,
      client_id: 'costumer-45',
      first_name: 'No',
      last_name: 'Lists',
      addresses: [],
      phones: [],
    },
  })

  assert(editWithMissingLists.addresses.length === 1, 'edit state should synthesize one default address when empty')
  assert(editWithMissingLists.phones.length === 2, 'edit state should synthesize primary/secondary phone slots when empty')
  assert(editWithMissingLists.operating_hours.length === 0, 'edit state should keep operating hours empty when missing')
}
