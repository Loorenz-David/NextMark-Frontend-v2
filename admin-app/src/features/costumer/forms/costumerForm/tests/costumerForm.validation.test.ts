import { validateCostumerFormShape } from '../state/CostumerForm.validation'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerFormValidationTests = () => {
  assert(
    !validateCostumerFormShape({ first_name: '', last_name: 'Doe', email: '', operating_hours: [] }),
    'first_name is required',
  )

  assert(
    !validateCostumerFormShape({ first_name: 'John', last_name: '', email: '', operating_hours: [] }),
    'last_name is required',
  )

  assert(
    !validateCostumerFormShape({ first_name: 'John', last_name: 'Doe', email: '', operating_hours: [] }),
    'email is required',
  )

  assert(
    !validateCostumerFormShape({ first_name: 'John', last_name: 'Doe', email: 'invalid-email', operating_hours: [] }),
    'email must be valid when provided',
  )

  assert(
    validateCostumerFormShape({ first_name: 'John', last_name: 'Doe', email: 'john@doe.com', operating_hours: [] }),
    'valid names and email should pass',
  )

  assert(
    !validateCostumerFormShape({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      operating_hours: [{ weekday: 0, open_time: '18:00', close_time: '09:00', is_closed: false }],
    }),
    'operating hours should fail when open time is later than close time',
  )

  assert(
    validateCostumerFormShape({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      operating_hours: [{ weekday: 0, is_closed: true }],
    }),
    'closed operating day should be valid without time values',
  )
}
